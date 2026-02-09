# Event Suppliers Platform - Frontend

Frontend application for the Event Suppliers Platform built with Next.js, TypeScript, and Tailwind CSS.

## Technology Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_APP_NAME=Event Suppliers Platform
NEXT_PUBLIC_ENVIRONMENT=development
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Authentication routes
│   ├── (public)/           # Public routes
│   └── (dashboard)/        # Protected routes
├── components/             # React components
│   ├── ui/                # Base UI components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   ├── reviews/           # Review components
│   └── suppliers/         # Supplier components
├── lib/                    # Utilities and configs
│   ├── api/               # API client and services
│   ├── store/             # Zustand stores
│   ├── utils/             # Helper functions
│   └── validations/       # Zod schemas
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── constants/              # App constants
```

## Features

### Public Features
- Browse suppliers with filters (city, state, category, price range)
- View supplier details
- Submit reviews (authenticated users)
- Submit contact forms
- View categories

### Supplier Dashboard
- Create/Edit supplier profile
- Manage media (images, videos, documents)
- Create/Edit contact forms
- View form submissions

### Admin Dashboard
- Moderate reviews (approve/reject)
- Manage categories
- Manage users

## Authentication

The app uses JWT tokens stored in localStorage. Tokens are automatically included in API requests via Axios interceptors.

## Security

- JWT tokens stored securely
- Protected routes with middleware
- Role-based access control
- Input validation with Zod
- XSS protection (sanitize user content)
- CSRF protection (Next.js built-in)

## Mobile Responsive

The application is built mobile-first and fully responsive across all device sizes.

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_ENVIRONMENT` - Environment (development/production)

## Build for Production

```bash
npm run build
npm start
```

## License

Private project
