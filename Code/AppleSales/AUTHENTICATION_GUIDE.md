# Authentication Guide

## 🔐 Authentication System Overview

The Manzana Mordida frontend implements a complete JWT-based authentication system with automatic token refresh and role-based access control.

---

## 📋 Features Implemented

### ✅ Login System
- Full login form with validation
- Email and password fields
- Password visibility toggle
- Form validation with Zod
- Error handling and display
- Loading states during submission
- Automatic redirect after successful login
- "Remember where you came from" redirect logic

### ✅ Registration System
- Complete registration form for new customers
- Fields: Name, Email, Phone (optional), Password, Confirm Password
- Password strength validation (8+ chars, uppercase, lowercase, number)
- Password confirmation matching
- Creates user in msSeguridad
- Creates customer profile in msClientes
- Automatic login after registration
- Error handling for duplicate emails

### ✅ Session Management
- JWT access token (15 min expiry)
- Refresh token (7 days expiry)
- Automatic token refresh on 401 errors
- Tokens stored in localStorage + cookies
- Session persistence across page reloads
- Automatic logout on token expiration

### ✅ Route Protection
- **ProtectedRoute**: Requires authentication
- **RoleBasedRoute**: Requires specific roles
- **PublicRoute**: Redirects if already authenticated
- Access denied page for insufficient permissions

---

## 🎨 UI Components

### LoginForm Component
**Location**: `/src/components/forms/LoginForm.jsx`

**Features**:
- Email field (required, validated)
- Password field with show/hide toggle
- Form validation with real-time error messages
- Loading state during submission
- Error alerts for failed login attempts
- Link to registration page

**Props**: None (self-contained)

**Usage**:
```jsx
import LoginForm from '../../components/forms/LoginForm';

<LoginForm />
```

### RegisterForm Component
**Location**: `/src/components/forms/RegisterForm.jsx`

**Features**:
- Name field (required, min 2 chars)
- Email field (required, validated format)
- Phone field (optional, format validated)
- Password field with show/hide toggle
- Confirm password field with matching validation
- Two-step registration (user + customer)
- Loading state during submission
- Error alerts for failed registration
- Link to login page

**Props**: None (self-contained)

**Usage**:
```jsx
import RegisterForm from '../../components/forms/RegisterForm';

<RegisterForm />
```

---

## 🔄 Authentication Flow

### Login Flow

```
1. User enters credentials
2. Form validates input (Zod schema)
3. Submit button clicked
4. Loading state enabled
5. API call to msSeguridad POST /auth/login
6. On success:
   - Access token stored in localStorage
   - Refresh token stored in localStorage + cookie
   - User data stored in Zustand store
   - Success toast notification
   - Redirect to original destination or home
7. On failure:
   - Error message displayed
   - Form remains active for retry
```

### Registration Flow

```
1. User fills registration form
2. Form validates all fields (Zod schema)
3. Password confirmation checked
4. Submit button clicked
5. Loading state enabled
6. Step 1: Create user in msSeguridad POST /auth/register
7. On success:
   - Step 2: Create customer in msClientes POST /clientes
   - User automatically logged in
   - Tokens stored
   - Success toast notification
   - Redirect to home
8. On failure:
   - Error message displayed
   - Form remains active for retry
```

### Token Refresh Flow

```
1. User makes authenticated API request
2. Server responds with 401 Unauthorized
3. Axios interceptor catches 401
4. Attempts token refresh POST /auth/refresh
5. On success:
   - New access token stored
   - Original request retried with new token
   - User continues seamlessly
6. On failure:
   - Tokens cleared
   - User logged out
   - Redirected to login page
```

### Logout Flow

```
1. User clicks "Cerrar Sesión"
2. Confirmation (optional)
3. API call to msSeguridad POST /auth/logout
4. Tokens removed from localStorage
5. Cookies cleared
6. Zustand store reset
7. Redirect to login page
```

---

## 📱 Pages

### LoginPage
**Route**: `/login`
**Access**: Public (redirects if authenticated)
**Components**: LoginForm
**Features**:
- Clean, centered layout
- Form in elevated paper card
- Terms and conditions notice
- Link to registration

### RegisterPage
**Route**: `/registro`
**Access**: Public (redirects if authenticated)
**Components**: RegisterForm
**Features**:
- Clean, centered layout
- Form in elevated paper card
- Terms and conditions notice
- Link to login

---

## 🛡️ Validation Rules

### Email Validation
```javascript
- Required
- Valid email format
- Example: user@example.com
```

### Password Validation (Registration)
```javascript
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- No special character requirement
```

### Password Validation (Login)
```javascript
- Required (no strength check on login)
```

### Name Validation
```javascript
- Minimum 2 characters
- Required
```

### Phone Validation
```javascript
- Optional
- Minimum 10 characters when provided
- Format: digits, +, spaces, (), - allowed
- Example: +54 11 1234-5678
```

---

## 🧪 Testing the Authentication

### Manual Testing Steps

#### Test Login
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:5173/login
3. Test invalid email format → Should show validation error
4. Test short password → Should show validation error
5. Test valid credentials (with backend running)
6. Should redirect to home page
7. Check header shows user avatar/menu

#### Test Registration
1. Navigate to http://localhost:5173/registro
2. Fill all fields with valid data
3. Test password mismatch → Should show error
4. Test weak password → Should show validation errors
5. Test duplicate email (with backend) → Should show error
6. Register with unique valid data
7. Should auto-login and redirect to home

#### Test Protected Routes
1. When not logged in, visit http://localhost:5173/perfil
2. Should redirect to /login
3. After login, should redirect back to /perfil

#### Test Role-Based Access
1. Login as viewer
2. Try to access http://localhost:5173/admin
3. Should show "Access Denied" page
4. Login as admin
5. Should access /admin successfully

#### Test Token Refresh
1. Login successfully
2. Wait 15+ minutes (token expiry)
3. Make any API request
4. Token should auto-refresh
5. Request should complete successfully

#### Test Logout
1. While logged in, click user avatar
2. Click "Cerrar Sesión"
3. Should clear session
4. Should redirect to /login
5. Try accessing /perfil → Should redirect to login

---

## 🔧 Configuration

### Environment Variables
```env
VITE_API_SEGURIDAD=http://localhost:3002
```

### Token Storage
- **Access Token**: `localStorage.getItem('access_token')`
- **Refresh Token**: `localStorage.getItem('refresh_token')`
- **User Data**: Zustand store (persisted)

### Token Expiry
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

---

## 🚨 Error Handling

### Common Errors

**Invalid credentials**
```
Display: "Credenciales incorrectas"
Code: 401
Action: Show error alert, keep form active
```

**Email already exists**
```
Display: "El correo electrónico ya está registrado"
Code: 400
Action: Show error alert, suggest login
```

**Network error**
```
Display: "Error de conexión. Por favor, intenta nuevamente."
Action: Show error alert, enable retry
```

**Token expired (refresh failed)**
```
Display: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
Action: Logout, redirect to login
```

**Server error**
```
Display: "Error del servidor. Por favor, intenta más tarde."
Code: 500
Action: Show error alert, enable retry
```

---

## 📚 API Endpoints Used

### msSeguridad (Port 3002)

**Login**
```
POST /auth/login
Body: { email, password }
Response: { user, accessToken, refreshToken }
```

**Register**
```
POST /auth/register
Body: { name, email, password, role }
Response: { user, accessToken, refreshToken }
```

**Refresh Token**
```
POST /auth/refresh
Body: { refreshToken }
Response: { accessToken, refreshToken }
```

**Logout**
```
POST /auth/logout
Headers: Authorization: Bearer {token}
Response: { message }
```

### msClientes (Port 3003)

**Create Customer**
```
POST /clientes
Body: { userId, name, email, phone }
Response: { customer }
```

---

## 🎯 Best Practices Implemented

1. **Never store passwords in state** - Only transmitted during login/register
2. **Automatic token refresh** - Seamless user experience
3. **Secure token storage** - localStorage + httpOnly cookies
4. **Form validation** - Client-side with Zod before API call
5. **Loading states** - User feedback during async operations
6. **Error boundaries** - Graceful error handling
7. **Password visibility toggle** - Better UX
8. **Remember redirect location** - Return to intended page after login
9. **Toast notifications** - Non-intrusive success/error messages
10. **Responsive design** - Works on mobile and desktop

---

## 🔜 Future Enhancements

- [ ] "Remember me" checkbox
- [ ] "Forgot password" flow
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, Apple)
- [ ] Session timeout warning
- [ ] Multiple device management
- [ ] Login history
- [ ] Password strength meter
- [ ] CAPTCHA for bot prevention

---

## 📝 Notes

- All user-facing text is in Spanish
- Forms use Material-UI components
- Validation uses Zod schemas
- State management uses Zustand
- HTTP client is Axios with interceptors
- Toast notifications use react-hot-toast

---

**Last Updated**: November 23, 2025
**Status**: Complete and Functional ✅
