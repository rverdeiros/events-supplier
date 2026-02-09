# app/main.py
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.core.middleware import limiter
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

app = FastAPI(title="Event Suppliers API")

# Configure rate limiter
app.state.limiter = limiter

# Handle rate limit exceeded errors
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "detail": f"Rate limit exceeded: {exc.detail}"
        }
    )

# CORS configurable via environment variable
# Default to localhost:3000 for development, should be set to specific origins in production
# Note: When allow_credentials=True, cannot use "*" - must specify exact origins
cors_origins_env = os.getenv("CORS_ORIGINS")
if cors_origins_env:
	cors_origins = [origin.strip() for origin in cors_origins_env.split(",")]
else:
	# Default development origins
	cors_origins = [
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://localhost:3001",  # Caso use outra porta
	]

app.add_middleware(
	CORSMiddleware,
	allow_origins=cors_origins,
	allow_credentials=True,
	allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
	allow_headers=["*"],
	expose_headers=["*"],
)

# Import models so SQLAlchemy sees them (dev only; prefer Alembic in prod)
from app.models import user_model, supplier_model, category_model, review_model, media_model, contact_form_model  # noqa: E402,F401

Base.metadata.create_all(bind=engine)

# Healthcheck
@app.get("/healthcheck")
def health():
	return {"status": "ok"}

# Register route modules AFTER app creation
from app.routes import auth_routes, supplier_routes, category_routes, review_routes, contact_form_routes, media_routes  # noqa: E402

app.include_router(auth_routes.router)
app.include_router(supplier_routes.router)
app.include_router(category_routes.router)
app.include_router(review_routes.router)
app.include_router(contact_form_routes.router)
app.include_router(media_routes.router)

# Mount static files directory for uploaded media
UPLOAD_DIR = Path("uploads/media")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
