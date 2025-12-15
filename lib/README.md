# Library Organization

This directory contains the core library code for the Atlas Gym application, organized into logical modules for better maintainability.

## Directory Structure

```
lib/
├── api/                 # API client and endpoint definitions
│   ├── api-client.ts    # Unified API client with error handling
│   ├── api-endpoints.ts # Centralized API endpoint constants
│   └── index.ts         # Barrel export
├── config/              # Configuration files
│   ├── cookies.ts       # Secure cookie configuration
│   └── index.ts         # Barrel export
├── schemas/             # Type definitions and validation schemas
│   ├── types.ts         # TypeScript type definitions
│   ├── validation.ts    # Zod validation schemas
│   └── index.ts         # Barrel export
├── auth.ts              # Authentication utilities
├── auth-context.tsx     # React auth context provider
├── db.ts                # Database connection utilities
└── utils.ts             # General utility functions
```

## Module Overview

### API Module (`lib/api`)

Handles all API communication with consistent error handling and type safety.

**Usage:**
```typescript
import { apiClient, ApiError, API_ENDPOINTS } from '@/lib/api'

// Make API calls
try {
  const data = await apiClient.login(email, password)
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.message, error.status)
  }
}

// Access endpoints
const loginUrl = API_ENDPOINTS.auth.login
```

**Features:**
- Unified API client with consistent error handling
- ApiError class for type-safe error handling
- Centralized endpoint definitions
- Automatic JSON handling

### Config Module (`lib/config`)

Contains configuration constants and settings.

**Usage:**
```typescript
import { getSecureCookieOptions, COOKIE_CONFIG } from '@/lib/config'

// Set secure cookies
response.cookies.set('session', sessionId, getSecureCookieOptions())
```

**Features:**
- Secure cookie configuration
- Environment-aware settings
- Centralized configuration constants

### Schemas Module (`lib/schemas`)

Provides TypeScript types and Zod validation schemas for runtime type checking.

**Usage:**
```typescript
import { 
  User, 
  UserData, 
  loginSchema, 
  registrationSchema 
} from '@/lib/schemas'

// Validate input
const validation = loginSchema.safeParse(data)
if (!validation.success) {
  // Handle validation errors
  console.error(validation.error.errors)
}

// Use TypeScript types
const user: UserData = {
  id: '123',
  email: 'user@example.com',
  firstname: 'John',
  lastname: 'Doe',
}
```

**Features:**
- Type-safe interfaces for database models
- Runtime validation with Zod
- Input sanitization
- Type inference from schemas

## Best Practices

### 1. Use Barrel Exports

Import from the module level rather than individual files:

```typescript
// ✅ Good
import { apiClient, API_ENDPOINTS } from '@/lib/api'
import { loginSchema, UserData } from '@/lib/schemas'

// ❌ Avoid
import { apiClient } from '@/lib/api/api-client'
import { loginSchema } from '@/lib/schemas/validation'
```

### 2. Type Safety

Always use the provided types and schemas:

```typescript
import { type UserData, loginSchema } from '@/lib/schemas'

// Validate at runtime
const result = loginSchema.safeParse(input)

// Use TypeScript types
const user: UserData = result.data.user
```

### 3. Error Handling

Use the ApiError class for consistent error handling:

```typescript
import { apiClient, ApiError } from '@/lib/api'

try {
  await apiClient.login(email, password)
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API errors
    toast.error(error.message)
  } else {
    // Handle unexpected errors
    toast.error('An unexpected error occurred')
  }
}
```

### 4. Validation

Always validate user input with Zod schemas:

```typescript
import { loginSchema } from '@/lib/schemas'

// Client-side validation
const validation = loginSchema.safeParse({ email, password })
if (!validation.success) {
  // Show validation errors to user
  return
}

// Server-side validation (in API routes)
const validation = loginSchema.safeParse(body)
if (!validation.success) {
  return NextResponse.json(
    { error: validation.error.errors[0].message },
    { status: 400 }
  )
}
```

## Adding New Modules

When adding new functionality:

1. Create a new subdirectory if needed (e.g., `lib/services/`)
2. Add an `index.ts` barrel export
3. Update this README
4. Export from the module level

Example:

```typescript
// lib/services/email.ts
export async function sendEmail(to: string, subject: string, body: string) {
  // Implementation
}

// lib/services/index.ts
export * from './email'

// Usage
import { sendEmail } from '@/lib/services'
```

## Migration Notes

### From Old Structure

If you're updating old code, replace imports as follows:

```typescript
// Old
import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api-endpoints'
import { loginSchema } from '@/lib/validation'
import { UserData } from '@/lib/types'
import { getSecureCookieOptions } from '@/lib/cookies'

// New
import { apiClient, API_ENDPOINTS } from '@/lib/api'
import { loginSchema, UserData } from '@/lib/schemas'
import { getSecureCookieOptions } from '@/lib/config'
```
