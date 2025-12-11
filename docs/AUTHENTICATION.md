# Authentication System

This document describes the authentication system implemented for the Atlas Gym application.

## Features

### User Registration
- Multi-step registration form with 4 steps:
  1. **Account**: Email and password
  2. **Personal**: First name, middle name (optional), last name, and birthdate
  3. **Contact**: Phone number (optional) and address (optional)
  4. **Payment**: Payment method (Credit Card or IBAN) with payment information (optional)

### User Login
- Simple login form with email and password
- Session-based authentication using HTTP-only cookies
- Sessions expire after 7 days

### Security Features
- Passwords are hashed using bcrypt with 10 salt rounds
- Sessions stored in PostgreSQL database
- HTTP-only cookies to prevent XSS attacks
- Password validation (minimum 8 characters)
- Email format validation

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_firstname  VARCHAR(50)  NOT NULL,
    user_lastname   VARCHAR(50)  NOT NULL,
    user_middlename VARCHAR(50),
    user_email      CITEXT       NOT NULL UNIQUE,
    password_hash   TEXT         NOT NULL,
    user_address    TEXT,
    user_birthdate  DATE         NOT NULL,
    user_phone      VARCHAR(20),
    payment_type    VARCHAR(20),  -- 'credit_card' or 'iban'
    payment_info    TEXT,         -- Payment information
    CONSTRAINT valid_email CHECK (user_email <> '')
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

## API Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstname": "John",
  "lastname": "Doe",
  "middlename": "M",
  "birthdate": "1990-01-01",
  "address": "123 Main St",
  "phone": "+1234567890",
  "paymentType": "credit_card",
  "paymentInfo": "1234 5678 9012 3456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

### POST /api/auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid email or password"
}
```

### POST /api/auth/logout
Logout the current user.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/session
Check if user is authenticated and get user information.

**Response (Authenticated):**
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "middlename": "M",
    "birthdate": "1990-01-01",
    "address": "123 Main St",
    "phone": "+1234567890"
  }
}
```

**Response (Not Authenticated):**
```json
{
  "authenticated": false,
  "user": null
}
```

## Authentication Utilities

The `lib/auth.ts` file provides the following utility functions:

- `hashPassword(password: string)`: Hash a password using bcrypt
- `verifyPassword(password: string, hash: string)`: Verify a password against its hash
- `createUser(data)`: Create a new user in the database
- `getUserByEmail(email: string)`: Get a user by email
- `authenticateUser(email: string, password: string)`: Authenticate a user
- `createSession(userId: string)`: Create a new session for a user
- `getSession(sessionId: string)`: Get a session by ID
- `deleteSession(sessionId: string)`: Delete a session
- `getUserBySessionId(sessionId: string)`: Get user information from session ID

## Usage

### Frontend Components

#### Login Form
Located at `/components/login-form.tsx`

Usage:
```tsx
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return <LoginForm />
}
```

#### Register Form
Located at `/components/register-form.tsx`

Usage:
```tsx
import { RegisterForm } from '@/components/register-form'

export default function RegisterPage() {
  return <RegisterForm />
}
```

## Environment Variables

Required environment variables:

```
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=atlas_gym
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
NODE_ENV=development
```

## Future Improvements

Potential enhancements:
- Email verification
- Password reset functionality
- Two-factor authentication
- OAuth integration (Google, Facebook, etc.)
- Password strength meter
- Account lockout after failed login attempts
- Remember me functionality
- Session management UI for users
- Encrypt payment information at rest
- PCI compliance for credit card data
