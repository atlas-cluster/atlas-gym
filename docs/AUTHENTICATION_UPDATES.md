# Authentication Updates - Additional Features

This document describes the additional authentication features implemented based on feedback.

## New Features

### 1. Route Protection with Middleware

All pages except `/login` and `/register` are now protected behind authentication.

**How it works:**
- A Next.js middleware (`middleware.ts`) intercepts all page requests
- Unauthenticated users are automatically redirected to `/login`
- The original URL is preserved as a redirect parameter
- After successful login, users are returned to their intended destination

**Protected Routes:**
- `/` (home page)
- All other application pages

**Public Routes:**
- `/login` - Login page
- `/register` - Registration page
- `/api/*` - API routes (handle their own authentication)

### 2. Dynamic Sidebar User Information

The sidebar now displays the actual logged-in user's information.

**Features:**
- Fetches user data from the session on page load
- Displays user's full name (first, middle, last)
- Shows user's email address
- User initials in avatar (e.g., "DU" for Demo User)
- Loading state with skeleton while fetching data

**Before:**
```tsx
<AppSidebarUser username="Luca Wahlen" email="mail@lucawahlen.de" />
```

**After:**
```tsx
<AppSidebarUser /> // Fetches from /api/auth/session
```

### 3. Functional Logout

The sidebar dropdown now includes a working logout button.

**How it works:**
- Clicking "Log out" in the dropdown menu calls `/api/auth/logout`
- Session is deleted from the database
- Session cookie is cleared
- User is redirected to `/login`

### 4. Sample User for Development

A pre-configured test user is now seeded in the database for easy local development.

**Sample User Credentials:**
```
Email: demo@atlas.gym
Password: password123
```

**User Details:**
- First Name: Demo
- Last Name: User
- Birthdate: 1990-01-01
- Address: 123 Demo Street, Atlas City
- Phone: +1234567890
- Payment Type: credit_card
- Payment Info: 4111 1111 1111 1111

**Location:** `db/init/02_seed_import.sql`

This user is automatically created when the database is initialized.

## Technical Implementation

### Middleware (`middleware.ts`)

The middleware handles route protection:

1. **Public Route Check**: Allows `/login` and `/register` without authentication
2. **Session Validation**: Checks for session cookie
3. **Session Verification**: Calls `/api/auth/session` to validate the session
4. **Redirect Logic**: Redirects to login with original URL if not authenticated

```typescript
// Example redirect
// Accessing: http://localhost:3000/dashboard
// Redirected to: http://localhost:3000/login?redirect=/dashboard
```

**Note on Performance:** The middleware validates sessions by making an HTTP call to `/api/auth/session` on every protected route request. For production use with high traffic, consider optimizing this by:
- Implementing direct database session validation in the middleware
- Using JWT tokens for stateless session validation
- Caching session validation results

### Updated Components

#### `components/app-sidebar-user.tsx`

Now fetches real user data:

```typescript
const [user, setUser] = useState<UserData | null>(null)

useEffect(() => {
  const fetchUser = async () => {
    const response = await fetch('/api/auth/session')
    const data = await response.json()
    if (data.authenticated && data.user) {
      setUser(data.user)
    }
  }
  fetchUser()
}, [])
```

Includes logout handler:

```typescript
const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  router.push('/login')
}
```

#### `components/login-form.tsx`

Now supports redirect parameter:

```typescript
const searchParams = useSearchParams()
const redirect = searchParams.get('redirect') || '/'
// After successful login:
router.push(redirect)
```

### Database Seed

The sample user is inserted using a bcrypt hash of "password123":

```sql
INSERT INTO gym_manager.users (
    user_email,
    password_hash,
    user_firstname,
    user_lastname,
    -- ... other fields
) VALUES (
    'demo@atlas.gym',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Demo',
    'User',
    -- ... other values
);
```

## User Experience Flow

### First-Time User Visit

1. User navigates to `http://localhost:3000/`
2. Middleware detects no session
3. User is redirected to `http://localhost:3000/login?redirect=/`
4. User logs in with demo credentials
5. User is redirected back to `/`
6. Sidebar shows "Demo User" with email "demo@atlas.gym"

### Logout Flow

1. User clicks avatar in sidebar
2. Dropdown menu appears
3. User clicks "Log out"
4. Logout API is called
5. Session is deleted
6. User is redirected to `/login`
7. Middleware will now protect all pages

### Protected Page Access

1. User tries to access any page (e.g., `/dashboard`)
2. Middleware checks session
3. If valid: Page loads normally with user info in sidebar
4. If invalid: Redirect to `/login?redirect=/dashboard`
5. After login: Return to `/dashboard`

## Testing the Changes

### Test Route Protection

1. **Without Login:**
   ```
   Navigate to: http://localhost:3000/
   Expected: Redirected to /login?redirect=/
   ```

2. **With Login:**
   ```
   1. Login with demo@atlas.gym / password123
   2. Navigate to: http://localhost:3000/
   3. Expected: Home page loads, sidebar shows "Demo User"
   ```

### Test Sidebar User Info

1. Login with the sample user
2. Check sidebar footer
3. Expected: Shows "Demo User" and "demo@atlas.gym"
4. Click avatar
5. Expected: Dropdown shows same info

### Test Logout

1. Login with the sample user
2. Click avatar in sidebar
3. Click "Log out"
4. Expected: Redirected to /login, session cleared
5. Try to access `/`
6. Expected: Redirected back to /login (session no longer valid)

### Test Redirect Flow

1. Without being logged in, navigate to `/` 
2. Expected: Redirected to `/login?redirect=/`
3. Login with demo credentials
4. Expected: Redirected back to `/`

## Files Modified

1. **middleware.ts** (new)
   - Route protection logic
   - Session validation
   - Redirect handling

2. **components/app-sidebar-user.tsx**
   - Removed props (username, email)
   - Added state for user data
   - Added useEffect to fetch user
   - Added logout handler
   - Added loading skeleton

3. **components/app-sidebar.tsx**
   - Removed hardcoded user props
   - Now renders `<AppSidebarUser />`

4. **components/login-form.tsx**
   - Added useSearchParams hook
   - Added redirect parameter handling
   - Redirects to original page after login

5. **db/init/02_seed_import.sql**
   - Added sample user INSERT statement
   - Includes bcrypt hashed password

## Environment Setup

No additional environment variables are required. The sample user will be automatically created when you initialize the database using Docker Compose.

### Running with Docker

```bash
npm run docker:dev
```

This will:
1. Start PostgreSQL with the database schema
2. Insert the sample user
3. Start the Next.js dev server
4. You can login with demo@atlas.gym / password123

## Security Considerations

### Session Validation

The middleware validates sessions on every request to protected routes. This ensures that:
- Expired sessions are caught immediately
- Deleted sessions (from logout) are not accepted
- Invalid session cookies are rejected

### Password Security

The sample user's password is stored using the same bcrypt hashing as production users:
- 10 salt rounds
- Hash: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
- Original: `password123`

⚠️ **Production Note:** In production, remove or change the sample user credentials.

### HTTP-Only Cookies

Session cookies remain HTTP-only and secure:
- Cannot be accessed by JavaScript
- Secure flag in production
- SameSite=lax for CSRF protection

## Summary

All requested features have been implemented:

- ✅ All pages except login/register are locked behind authentication
- ✅ Sidebar displays actual user info (name and email)
- ✅ Logout functionality works in the sidebar dropdown
- ✅ Sample user available for easy local development (demo@atlas.gym / password123)

The authentication system is now complete with full route protection, dynamic user information display, and a convenient sample user for testing.
