# Business Rules & Criteria - Event Suppliers Platform

Complete documentation of all business rules, constraints, and criteria implemented in the MVP.

**Last Updated:** January 2025  
**Version:** MVP v1.1

---

## Table of Contents
1. [User Management](#user-management)
2. [Authentication & Authorization](#authentication--authorization)
3. [Supplier Management](#supplier-management)
4. [Category Management](#category-management)
5. [Review System](#review-system)
6. [Media Management](#media-management)
7. [Contact Forms](#contact-forms)
8. [Data Validation Rules](#data-validation-rules)
9. [API Response Standards](#api-response-standards)

---

## User Management

### User Types
- **client** - Default type for regular users/clients
- **supplier** - Users who provide event services
- **admin** - Platform administrators with full access

### User Registration Rules
- **Email uniqueness:** Each email can only be registered once
- **Password requirements:** 
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - Validation applies only to new registrations and password changes (not retroactive)
- **Name requirements:** Minimum 2 characters, maximum 120 characters
- **Email validation:** Must be a valid email format (Pydantic EmailStr)
- **Email verification:** Not required in MVP (email verification is a post-MVP feature)
- **Default type:** If not specified, user type defaults to "client"
- **Type validation:** User type must be one of: `client`, `supplier`, `admin`

### User Deletion Rules
- **Admin only:** Only admin users can delete other users
- **Self-deletion:** Not implemented in MVP (post-MVP feature)
- **Cascade behavior:** Deleting a user should handle related data (suppliers, reviews, etc.) - currently handled at application level

### User Listing Rules
- **Admin only:** Only admin users can list all users
- **Ordering:** Users are listed by creation date (newest first)

---

## Authentication & Authorization

### Authentication Rules
- **JWT tokens:** All authenticated endpoints require a valid JWT token
- **Token expiration:** Tokens expire after 24 hours (configurable)
- **Token format:** Bearer token in Authorization header: `Bearer <token>`
- **Password hashing:** Passwords are hashed using PBKDF2-SHA256 (supports long passwords)
- **Logout:** Logout removes token from frontend only (tokens are not invalidated on backend in MVP)
- **Multiple sessions:** Users can have unlimited simultaneous active sessions
- **Password reset:** Not implemented in MVP (post-MVP feature)

### Authorization Levels

#### Public Endpoints (No authentication required)
- List suppliers (GET `/fornecedores`)
- Get supplier by ID (GET `/fornecedores/{id}`)
- List categories (GET `/categorias`)
- List approved reviews for supplier (GET `/reviews/supplier/{supplier_id}`)
- List supplier media (GET `/media/supplier/{supplier_id}`)
- Get supplier contact form (GET `/contact-forms/supplier/{supplier_id}`)
- Get default contact form template (GET `/contact-forms/default-template`)
- Submit contact form (POST `/contact-forms/{id}/submit`)

#### Authenticated Endpoints (Valid token required)
- Create supplier (POST `/fornecedores`)
- Update supplier (PUT `/fornecedores/{id}`) - requires ownership or admin
- Delete supplier (DELETE `/fornecedores/{id}`) - requires ownership or admin
- Create review (POST `/reviews`)
- Upload media (POST `/media`) - requires supplier ownership
- Delete media (DELETE `/media/{id}`) - requires ownership or admin
- Create contact form (POST `/contact-forms`) - requires supplier ownership
- Update contact form (PUT `/contact-forms/{id}`) - requires ownership
- Delete contact form (DELETE `/contact-forms/{id}`) - requires ownership or admin
- List form submissions (GET `/contact-forms/{id}/submissions`) - requires ownership or admin

#### Admin Only Endpoints
- List all users (GET `/auth/users`)
- Delete user (DELETE `/auth/users/{id}`)
- Create category (POST `/categorias`)
- Update category (PUT `/categorias/{id}`)
- Delete category (DELETE `/categorias/{id}`)
- List pending reviews (GET `/reviews/pending`)
- Approve review (PUT `/reviews/{id}/approve`)
- Reject review (PUT `/reviews/{id}/reject`)

### Ownership Rules
- **Supplier ownership:** A user owns a supplier if `supplier.user_id == current_user.id`
- **Update permissions:** Only the owner or admin can update a supplier
- **Delete permissions:** Only the owner or admin can delete a supplier
- **Media permissions:** Only the supplier owner can upload media to their supplier profile
- **Contact form permissions:** Only the supplier owner can create/update their contact form

### Rate Limiting Rules
Rate limiting is implemented to prevent API abuse:
- **Login endpoint:** Maximum 5 attempts per IP address in 15 minutes
- **Review creation:** Maximum 10 reviews per hour per authenticated user
- **Contact form submission:** Maximum 3 submissions per IP address in 1 hour
- **Rate limit exceeded:** Returns HTTP 429 Too Many Requests with retry-after header

---

## Supplier Management

### Supplier Creation Rules
- **One supplier per user:** Each user can create only one supplier profile
- **Required fields:**
  - `fantasy_name` (string, required)
  - `city` (string, required)
  - `state` (string, required)
  - `phone` (string, required) - Must be 10-15 digits (numbers and common special characters: +, -, spaces, parentheses)
  - `email` (valid email, required)
- **Optional fields:**
  - `description` (text)
  - `category_id` (integer) - must exist in categories table and be active
  - `price_range` (string)
  - `instagram_url` (valid URL)
  - `whatsapp_url` (valid URL)
  - `site_url` (valid URL)
- **URL validation:** All URL fields must be valid URLs (Pydantic HttpUrl)
- **Email validation:** Email must be valid format (Pydantic EmailStr)
- **Phone validation:** Phone must contain 10-15 digits (allowing common formatting characters)
- **Category validation:** If `category_id` is provided, it must exist in the categories table and have `active=true`
- **Default status:** New suppliers are created with `status="active"`
- **User assignment:** `user_id` is automatically set from the authenticated user
- **Profile completeness:** A supplier profile is considered "complete" when it has all required fields plus `category_id` and `description` (minimum 50 characters). Incomplete profiles can still appear in public listings but should be marked visually.
- **Duplicate prevention:** System alerts admin (but does not block) when a supplier with the same `fantasy_name` and `city` already exists

### Supplier Listing Rules
- **Public access:** Anyone can list suppliers (no authentication required)
- **Status filter:** Only suppliers with `status="active"` are returned in public listings
- **Filtering options:**
  - `city` - Partial match (case-insensitive, ILIKE)
  - `state` - Partial match (case-insensitive, ILIKE)
  - `category_id` - Exact match
  - `price_range` - Exact match
- **Pagination:** Default page size is 10, maximum is 50
- **Ordering options:**
  - Default: Creation date (newest first)
  - Available: Creation date, average rating (highest first)
  - Ordering parameter: `order_by` (values: `created_at`, `rating`)

### Supplier Update Rules
- **Partial updates:** All fields are optional in update requests
- **Ownership required:** Only the supplier owner or admin can update
- **Category validation:** If updating `category_id`, it must exist in categories table and be active
- **Status updates:** Status can be updated by admin only (suppliers cannot change their own status)
- **Edit limits:** No limit on number of edits per supplier (all edits are logged for audit purposes)

### Supplier Deletion Rules
- **Ownership required:** Only the supplier owner or admin can delete
- **Cascade behavior:** Deleting a supplier should handle related data (reviews, media, contact forms) - currently handled at application level

### Supplier Status Values
- **active** - Supplier is active and visible in public listings
- **pending** - Supplier is pending approval (not used in MVP - all suppliers start as "active")
- **blocked** - Supplier is blocked by admin and not visible in public listings
- **Status workflow:**
  - New suppliers are created with `status="active"` (no approval required in MVP)
  - Only admin can change status to "blocked"
  - Only admin can unblock a supplier (change from "blocked" to "active")

---

## Category Management

### Category Creation Rules (Admin Only)
- **Name uniqueness:** Category names must be unique
- **Required fields:**
  - `name` (string, required)
- **Optional fields:**
  - `origin` (string, default: "manual") - Values: "fixed" or "manual"
  - `active` (boolean, default: true)
- **Fixed categories:** Categories with `origin="fixed"` are system categories (e.g., Photography, Catering)

### Category Listing Rules
- **Public access:** Anyone can list categories
- **Filtering:** Can filter by `active` status
- **Pagination:** Default page size is 50, maximum is 50
- **Ordering:** Categories are ordered alphabetically by name

### Category Update Rules (Admin Only)
- **Partial updates:** All fields are optional
- **Name uniqueness:** Updated name must not conflict with existing categories
- **Cannot change origin:** Origin field should not be changed (business rule)
- **Active status:** When a category is deactivated (`active=false`):
  - New suppliers cannot be assigned to inactive categories
  - Existing suppliers keep their category assignment
  - Category continues to appear in search filters if it has suppliers using it
  - Category appears in listings normally (inactive status does not hide it from filters)

### Category Deletion Rules (Admin Only)
- **Protection:** Cannot delete a category if any suppliers are using it
- **Validation:** System checks for suppliers with `category_id` matching the category
- **Error message:** Returns 400 with count of suppliers using the category

---

## Review System

### Review Creation Rules
- **Authentication required:** Only authenticated users can create reviews
- **One review per supplier:** Each user can only review a supplier once
- **Supplier validation:** Supplier must exist
- **Rating validation:** Rating must be between 1 and 5 (inclusive)
- **Comment validation:** Comment must be at least 10 characters (whitespace-only comments are not allowed)
- **Default status:** All reviews start with `status="pending"`
- **User assignment:** `user_id` is automatically set from the authenticated user
- **Rate limiting:** Maximum 10 reviews per hour per authenticated user

### Review Status Workflow
1. **pending** - Review is submitted and awaiting moderation
2. **approved** - Review is approved by admin and visible publicly
3. **rejected** - Review is rejected by admin and not visible

### Review Listing Rules
- **Public listings:** Only show reviews with `status="approved"`
- **Pagination:** Default page size is 10, maximum is 50
- **Ordering:** Reviews are ordered by creation date (newest first)
- **User information:** Public listings include `user_name` (not `user_id`)
- **Average rating calculation:**
  - Calculated only from approved reviews
  - Formula: Sum of all approved ratings / Number of approved reviews
  - Rounded to 1 decimal place (e.g., 4.5)
  - Displayed only if supplier has at least 1 approved review
  - Recalculated automatically when a review is approved

### Review Moderation Rules (Admin Only)
- **Pending reviews:** Admin can list all pending reviews
- **Approval:** Admin can approve pending reviews (changes status to "approved")
- **Rejection:** Admin can reject pending reviews (changes status to "rejected")
- **Status validation:** Can only approve/reject reviews with `status="pending"`
- **Error handling:** Returns 400 if trying to approve/reject a non-pending review
- **After approval:** Average rating of supplier is automatically recalculated

### Review Edit Rules
- **User edit:** Users can edit their own reviews within 24 hours of creation
- **After edit:** Edited reviews return to `status="pending"` and require re-approval
- **Admin edit:** Admin can edit any review at any time
- **Edit validation:** Same validation rules apply (rating 1-5, comment minimum 10 characters)

### Review Deletion Rules
- **User deletion:** Users can delete their own reviews
- **Admin deletion:** Admin can delete any review
- **After deletion:** Average rating of supplier is automatically recalculated

### Review Display Rules
- **Public visibility:** Only approved reviews are shown in supplier listings
- **User privacy:** Public listings show `user_name`, not `user_id` or email
- **Moderation info:** Admin views show full user and supplier information

---

## Media Management

### Media Upload Rules (Supplier Owner Only)
- **Ownership required:** Only the supplier owner can upload media
- **Supplier validation:** Supplier must exist
- **Type validation:** Type must be one of: `image`, `video`, `document`
- **URL validation:** URL must be a valid URL format (Pydantic HttpUrl)
- **Media limits:** Maximum media items per supplier:
  - 20 images
  - 5 videos
  - 10 documents
  - Limits are enforced per type (not combined total)
- **URL accessibility:** System validates URL format only (accessibility check is post-MVP)
- **Automatic timestamp:** `upload_date` is automatically set

### Media Listing Rules
- **Public access:** Anyone can list supplier media
- **Type filtering:** Can filter by media type (`image`, `video`, `document`)
- **Pagination:** Default page size is 20, maximum is 50
- **Ordering:** Media is ordered by upload date (newest first)

### Media Deletion Rules
- **Ownership required:** Only the supplier owner or admin can delete
- **Media validation:** Media must exist

---

## Contact Forms

### Contact Form Creation Rules (Supplier Owner Only)
- **One form per supplier:** Each supplier can have only one contact form (unique constraint)
- **Default template:** If `questions` array is empty, uses default template automatically
- **Question validation:** Questions must follow QuestionItem schema
- **Default status:** Forms are created with `active=true`
- **Supplier requirement:** User must have a supplier profile before creating a form

### Question Types & Rules
Supported question types:
- **text** - Single line text input
- **textarea** - Multi-line text input
- **email** - Email input with validation
- **phone** - Phone number input
- **number** - Numeric input (supports `min_value`, `max_value`)
- **select** - Single select dropdown (requires `options` array)
- **multiselect** - Multiple choice dropdown (requires `options` array)
- **radio** - Radio buttons for single selection (requires `options` array)
- **checkbox** - Checkboxes for multiple selection (requires `options` array)
- **date** - Date picker
- **datetime** - Date and time picker

### Question Validation Rules
- **Question text:** Required, minimum 1 character
- **Type validation:** Type must be one of the supported types (Literal validation)
- **Options requirement:** Types `select`, `multiselect`, `radio`, `checkbox` require `options` array with at least one option
- **Question limit:** Maximum 20 questions per contact form
- **Optional fields:**
  - `required` (boolean, default: false)
  - `placeholder` (string)
  - `min_value` / `max_value` (number) - For number type
  - `min_length` / `max_length` (integer) - For text/textarea types

### Default Form Template
The default template includes 9 pre-configured questions:
1. Nome completo (text, required)
2. E-mail (email, required)
3. Telefone/WhatsApp (phone, required)
4. Data do evento (date, required)
5. Número de convidados (number, required)
6. Local do evento (text, optional)
7. Tipo de evento (select, required) - with options
8. Orçamento estimado (select, optional) - with options
9. Conte-nos mais sobre seu evento (textarea, optional)

### Contact Form Update Rules (Supplier Owner Only)
- **Ownership required:** Only the supplier owner can update their form
- **Full replacement:** Updating replaces all questions (not partial update)
- **Active status:** Can update `active` status to enable/disable form

### Contact Form Reset Rules (Supplier Owner Only)
- **Reset to default:** Can reset form to default template
- **Ownership required:** Only the supplier owner can reset

### Contact Form Submission Rules (Public)
- **Public access:** Anyone can submit a contact form (no authentication required)
- **Active requirement:** Form must be `active=true` to accept submissions
- **Form validation:** Form must exist
- **Answer validation:** All validations are enforced on backend:
  - Required questions must be answered
  - Email format validation for email-type questions
  - Phone format validation for phone-type questions
  - Min/max value validation for number-type questions
  - Min/max length validation for text/textarea-type questions
  - Selected options must be in the allowed options list
- **Answers format:** Answers are stored as JSON object (key-value pairs)
- **Submitter information:** Optional fields: `submitter_name`, `submitter_email`, `submitter_phone`
- **Rate limiting:** Maximum 3 submissions per IP address in 1 hour
- **Automatic timestamp:** `created_at` is automatically set

### Form Submission Listing Rules (Supplier Owner/Admin Only)
- **Ownership required:** Only the supplier owner or admin can view submissions
- **Pagination:** Default page size is 10, maximum is 50
- **Ordering:** Submissions are ordered by creation date (newest first)
- **Read status:** Submissions have a `read` status (boolean):
  - New submissions start with `read=false`
  - Supplier can mark submissions as read (`read=true`)
  - Dashboard shows count of unread submissions

---

## Data Validation Rules

### Email Validation
- **Format:** Must be valid email format (Pydantic EmailStr)
- **Used in:** User registration, supplier email, contact form submitter email

### URL Validation
- **Format:** Must be valid URL format (Pydantic HttpUrl)
- **Used in:** Supplier URLs (instagram_url, whatsapp_url, site_url), media URLs

### Password Validation
- **Minimum length:** 8 characters
- **Additional requirements:** At least 1 uppercase letter and 1 number
- **Hashing:** PBKDF2-SHA256 (supports passwords longer than 72 bytes)
- **Validation scope:** Applies to new registrations and password changes only (not retroactive)

### String Length Constraints
- **User name:** 2-120 characters
- **Supplier fantasy_name:** Up to 150 characters (database constraint)
- **Supplier description:** Minimum 50 characters for complete profile
- **Review comment:** Minimum 10 characters (whitespace-only not allowed)
- **Contact form question:** Minimum 1 character
- **Phone number:** 10-15 digits (allowing formatting characters: +, -, spaces, parentheses)

### Numeric Constraints
- **Review rating:** 1-5 (inclusive)
- **Number questions:** Supports `min_value` and `max_value` constraints
- **Text questions:** Supports `min_length` and `max_length` constraints

### Foreign Key Constraints
- **Supplier → User:** One-to-one relationship (unique constraint)
- **Supplier → Category:** Many-to-one relationship (optional)
- **Review → User:** Many-to-one relationship (required)
- **Review → Supplier:** Many-to-one relationship (required)
- **Media → Supplier:** Many-to-one relationship (required)
- **ContactForm → Supplier:** One-to-one relationship (unique constraint)
- **ContactFormSubmission → ContactForm:** Many-to-one relationship (required)

---

## API Response Standards

### Success Response Format
All successful responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful message",
  "data": { /* Response data */ }
}
```

### List Response Format (with pagination)
```json
{
  "success": true,
  "data": [ /* Array of items */ ],
  "total": 100,
  "page": 1,
  "page_size": 10,
  "total_pages": 10
}
```

### Error Response Format
```json
{
  "detail": "Error message here"
}
```

### HTTP Status Codes
- **200 OK** - Successful operation
- **400 Bad Request** - Validation error or business rule violation
- **401 Unauthorized** - Missing or invalid authentication token
- **403 Forbidden** - Insufficient permissions (not owner/admin)
- **404 Not Found** - Resource not found
- **422 Unprocessable Entity** - Request validation failed (Pydantic validation)

---

## Business Constraints & Limitations

### Current Limitations (MVP)
1. **No file uploads:** Media URLs must be external (no local file storage)
2. **No email notifications:** Form submissions don't trigger emails
3. **No search functionality:** Only filtering, no full-text search
4. **No API versioning:** Single version endpoint structure
5. **No soft deletes:** Deletions are permanent (hard deletes)
6. **No audit logging:** Detailed tracking of who changed what and when (basic logging exists)
7. **No pagination limits enforcement:** Frontend must respect max page_size
8. **No password reset:** Users cannot reset forgotten passwords (post-MVP feature)
9. **No email verification:** Email addresses are not verified (post-MVP feature)
10. **No self-deletion:** Users cannot delete their own accounts (post-MVP feature)
11. **No refresh tokens:** JWT tokens expire after 24 hours, users must login again
12. **No cache:** No caching layer implemented (post-MVP optimization)

### Data Integrity Rules
1. **Cascade deletions:** Application-level handling (not database-level)
2. **Unique constraints:**
   - User email (unique)
   - Supplier per user (one supplier per user_id)
   - Contact form per supplier (one form per supplier_id)
   - Category name (unique)
   - Review per user per supplier (one review per user_id + supplier_id combination)
3. **Foreign key validation:** All foreign keys are validated before insertion/update

### Security Rules
1. **Input sanitization:** HTML is escaped in user-generated content:
   - Review comments
   - Supplier descriptions
   - Contact form text/textarea answers
   - Prevents XSS (Cross-Site Scripting) attacks
2. **SQL Injection prevention:** All database queries use SQLAlchemy parameterized queries (automatic protection)
3. **CORS:** Configured to allow only specific domains in production
4. **Password security:** Passwords are never returned in API responses, even hashed
5. **Token security:** JWT tokens contain only necessary information (user_id, email, type, exp)

### Performance Considerations
1. **Pagination:** All list endpoints support pagination
2. **Filtering:** List endpoints support filtering to reduce data transfer
3. **Indexing:** Critical indexes implemented:
   - Primary keys and foreign keys (SQLAlchemy default)
   - `suppliers`: city, state, category_id, status
   - `reviews`: supplier_id, status
   - `users`: email (unique index)
4. **Query optimization:** Uses SQLAlchemy relationships for efficient queries
5. **Request timeout:** 30 seconds maximum for API requests
6. **Input sanitization:** HTML is escaped in reviews and supplier descriptions to prevent XSS attacks

---

## Future Enhancements (Not in MVP)

### Planned Features
1. **File upload system:** Local or cloud storage for media
2. **Email notifications:** Notify suppliers of form submissions
3. **Advanced search:** Full-text search across suppliers
4. **Rate limiting:** Protect API from abuse
5. **API versioning:** Support multiple API versions
6. **Soft deletes:** Recoverable deletions
7. **Audit logging:** Track all changes
8. **Bulk operations:** Batch create/update/delete
9. **Export functionality:** Export data to CSV/Excel
10. **Analytics:** Track views, submissions, etc.

### Security Enhancements
1. **Password reset:** Forgot password functionality
2. **Email verification:** Verify user emails
3. **Two-factor authentication:** Additional security layer
4. **Role-based access control:** More granular permissions
5. **API key management:** For third-party integrations

---

## Revision History

- **January 2025** - MVP v1.1 - Updated with gap analysis resolutions
  - Enhanced password validation (uppercase + number requirement)
  - Token expiration increased to 24 hours
  - Rate limiting implemented (login, reviews, form submissions)
  - Phone number validation (10-15 digits)
  - Supplier profile completeness rules
  - Review editing rules (24-hour window)
  - Average rating calculation rules
  - Media limits per supplier (20 images, 5 videos, 10 documents)
  - Contact form answer validation rules
  - Form submission read status
  - Category inactive status rules (appears in filters if has suppliers)
  - Ordering options for suppliers (by date and rating)
  - Input sanitization rules
  - Database indexing strategy

- **January 2024** - MVP v1.0 - Initial MVP documentation
  - User management
  - Supplier CRUD with filters
  - Category management
  - Review system with moderation
  - Media management
  - Contact forms with default template

---

**Note:** This document should be updated whenever new business rules are implemented or existing rules are modified.

