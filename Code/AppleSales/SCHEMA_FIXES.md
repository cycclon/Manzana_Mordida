# Schema Alignment Fixes

## 🔧 Changes Made to Match Backend Schemas

### Issue
The frontend forms were not matching the actual backend database schemas, causing potential integration issues.

### Root Cause Analysis
The backend uses:
- **Username-based authentication** (not email)
- **Separate first name and last name** fields (`nombres` / `apellidos`)
- **WhatsApp** field (not generic "phone")
- **Usuario field** to link Customer to User (via username, not userId)

---

## ✅ Fixed Files

### 1. **Validators** (`/src/utils/validators.js`)

**Added:**
- `usernameSchema` - Validates username (4+ chars, alphanumeric + `.`, `_`, `-`)
- Updated `loginSchema` - Now uses `username` instead of `email`
- Updated `registerSchema` - Now includes:
  - `username` (required, validated)
  - `nombres` (first name, required)
  - `apellidos` (last name, required)
  - `whatsapp` (optional, replaces `phone`)
- Added `customerSchema` - For customer creation with proper field names

**Password Validation Updated:**
- Must have at least 8 characters
- Must have at least 1 UPPERCASE letter
- Must have at least 1 number
- (Matches backend regex: `/^(?=.*[A-Z])(?=.*\d).{8,}$/`)

**Username Validation:**
- Minimum 4 characters
- Pattern: `/^[a-zA-Z0-9._-]{4,}$/`
- Only letters, numbers, dot, underscore, hyphen
- (Matches backend validation)

---

### 2. **Auth API** (`/src/api/auth.js`)

**Changes:**
- `login()` - Now sends `{ username, password }` instead of `{ email, password }`
- `register()` - Now sends `{ username, password }` to `/users/register`
- Added `registerStaff()` - For admin-created staff users (sales/admin roles)
- Added `checkViewerExists()` - Check username availability
- Removed role parameter from public registration (backend sets it to 'viewer' automatically)

**Endpoints Updated:**
- Login: `POST /auth/login` with username
- Register: `POST /users/register` with username + password
- Register Staff: `POST /users/register-staff` (admin only)

---

### 3. **Customers API** (`/src/api/customers.js`)

**Changes:**
- `createCustomer()` - Now sends correct schema:
  ```json
  {
    "nombres": "Pedro Raul",
    "apellidos": "Spidalieri",
    "email": "pedro@example.com",
    "whatsapp": "3804280591",
    "usuario": "cycclon"
  }
  ```
- Added `getCustomerByUsername()` - Get customer by username instead of userId
- `updateCustomer()` - Only sends `email` and `whatsapp` (immutable fields not sent)
- Updated endpoint: `/api/v1/clientes/nuevo-cliente`

**Field Mapping:**
- ~~`name`~~ → `nombres` + `apellidos` (separate)
- ~~`phone`~~ → `whatsapp`
- ~~`userId`~~ → `usuario` (username string)

---

### 4. **LoginForm** (`/src/components/forms/LoginForm.jsx`)

**Changes:**
- Field changed from "Correo Electrónico" to "Nombre de Usuario"
- Input `name` changed from `email` to `username`
- `autoComplete` changed to `username`
- Added placeholder: `usuario123`
- Validation updated to use `usernameSchema`

**API Call:**
```javascript
await login({
  username: data.username,  // Changed from email
  password: data.password
});
```

---

### 5. **RegisterForm** (`/src/components/forms/RegisterForm.jsx`)

**Major Overhaul:**

**New Fields (in order):**
1. **Nombre de Usuario** (`username`) - Required, 4+ chars
2. **Nombre(s)** (`nombres`) - Required, first/given name
3. **Apellido(s)** (`apellidos`) - Required, last name
4. **Correo Electrónico** (`email`) - Required
5. **WhatsApp** (`whatsapp`) - Optional
6. **Contraseña** (`password`) - Required, with strength validation
7. **Confirmar Contraseña** (`confirmPassword`) - Required

**Layout:**
- Username: Full width
- Nombres/Apellidos: Grid layout (50/50 on desktop, full width on mobile)
- Email: Full width
- WhatsApp: Full width
- Passwords: Full width

**Two-Step Registration:**
```javascript
// Step 1: Create User in msSeguridad
await registerUser({
  username: data.username,
  password: data.password
  // role='viewer' set automatically
});

// Step 2: Create Customer in msClientes
await customersAPI.createCustomer({
  nombres: data.nombres,
  apellidos: data.apellidos,
  email: data.email,
  whatsapp: data.whatsapp || '',
  usuario: data.username  // Links via username
});
```

**Helper Text Added:**
- Username: "Mínimo 4 caracteres. Solo letras, números, punto, guión"
- Password: "Mínimo 8 caracteres, 1 mayúscula, 1 número"

**Placeholders Added:**
- Username: `usuario123`
- Nombres: `Juan Carlos`
- Apellidos: `García López`
- Email: `usuario@ejemplo.com`
- WhatsApp: `+54 11 1234-5678`

---

## 📊 Schema Comparison

### Before (Incorrect) vs After (Correct)

#### Login
| Before | After |
|--------|-------|
| email | **username** |
| password | password |

#### Registration (User)
| Before | After |
|--------|-------|
| name | *(removed)* |
| email | *(removed from User)* |
| password | password |
| *(missing)* | **username** |

#### Registration (Customer)
| Before | After |
|--------|-------|
| *(same as name)* | **nombres** |
| *(not separated)* | **apellidos** |
| email | email |
| phone | **whatsapp** |
| userId | **usuario** (username) |

---

## 🎯 Backend Schema Reference

### User Model (msSeguridad)
```javascript
{
  username: String (required, unique, 4+ chars, pattern)
  password: String (required, hashed, 8+ chars with uppercase & number)
  role: String (enum: ['admin', 'sales', 'viewer'], default: 'viewer')
}
```

### Customer Model (msClientes)
```javascript
{
  nombres: String (required),
  apellidos: String (required),
  email: String (required),
  whatsapp: String (optional),
  usuario: String (required, links to User.username)
}
```

---

## ✅ Testing Checklist

### Login Form
- [x] Username field accepts valid usernames
- [x] Validation: min 4 chars, pattern check
- [x] Password field works
- [x] Form submits with username + password
- [x] Error handling for invalid credentials

### Register Form
- [x] All 7 fields display correctly
- [x] Username validation (4+ chars, pattern)
- [x] Name fields separated (nombres / apellidos)
- [x] Email validation
- [x] WhatsApp optional, validated when provided
- [x] Password strength validation (8+ chars, uppercase, number)
- [x] Password confirmation matching
- [x] Two-step registration (User + Customer)
- [x] Grid layout for nombres/apellidos
- [x] Helper text and placeholders
- [x] Links via `usuario` (username)

### API Integration
- [x] Login endpoint: `POST /auth/login` with username
- [x] Register endpoint: `POST /users/register` with username
- [x] Customer creation: `POST /api/v1/clientes/nuevo-cliente`
- [x] Correct field names in all requests
- [x] Proper error handling

---

## 🚀 Build Status

✅ **Build Successful** - No errors
- Build time: 3.35s
- Bundle size: 671.97 KB (214.95 KB gzipped)
- All forms compile correctly
- Validation schemas working

---

## 📝 Notes

1. **Immutable Fields**: In Customer model, `nombres`, `apellidos`, and `usuario` cannot be changed after creation. Only `email` and `whatsapp` are editable.

2. **Username Uniqueness**: The backend validates username uniqueness. Frontend should add a "check availability" feature (using `checkViewerExists` endpoint).

3. **Role Assignment**: Public registration always creates 'viewer' role. Only admins can create 'sales' or 'admin' users via `registerStaff` endpoint.

4. **Customer Linking**: Customer must be created AFTER user registration, and `usuario` field must match an existing 'viewer' username in msSeguridad.

5. **Password Requirements**: Backend enforces password strength. Minimum 8 characters with at least one uppercase letter and one number.

---

## 🔄 Migration Notes

If there are existing users in the database:
- Old email-based logins will fail
- Users need usernames to log in
- Customer profiles need `nombres`/`apellidos` instead of single `name`
- `phone` fields need to be renamed to `whatsapp`
- Customer `userId` references need to be replaced with `usuario` (username strings)

---

**Last Updated**: November 23, 2025
**Status**: ✅ **All schemas aligned with backend**
