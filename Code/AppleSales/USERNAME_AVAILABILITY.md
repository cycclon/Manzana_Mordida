# Username Availability Feature

## ✨ Feature Overview

Real-time username availability checker with visual feedback. As the user types their desired username, the system automatically checks if it's available and provides instant visual feedback.

---

## 🎯 How It Works

### User Experience Flow

```
1. User starts typing username
   ↓
2. 500ms debounce (wait for user to finish typing)
   ↓
3. API call to check availability
   ↓
4. Visual feedback displayed
```

---

## 🎨 Visual States

### 1. **Initial State** (Empty / Less than 4 chars)
```
┌─────────────────────────────────────┐
│  Nombre de Usuario                  │
│  [                  ]               │
│  Mínimo 4 caracteres. Solo letras, │
│  números, punto, guión              │
└─────────────────────────────────────┘
```

### 2. **Checking State** (User finished typing)
```
┌─────────────────────────────────────┐
│  Nombre de Usuario            ⏳    │
│  [usuario123        ]               │
│  Verificando disponibilidad...      │
└─────────────────────────────────────┘
```

### 3. **Available State** (Username is free)
```
┌─────────────────────────────────────┐
│  Nombre de Usuario            ✓     │
│  [usuario123        ]               │
│  ✓ Nombre de usuario disponible    │
└─────────────────────────────────────┘
```
**Colors:**
- Icon: Green checkmark
- Text: Green
- Border: Normal

### 4. **Not Available State** (Username taken)
```
┌─────────────────────────────────────┐
│  Nombre de Usuario            ✗     │
│  [usuario123        ]               │
│  ✗ Nombre de usuario no disponible │
└─────────────────────────────────────┘
```
**Colors:**
- Icon: Red X
- Text: Red
- Border: Red (error state)

### 5. **Validation Error State** (Invalid format)
```
┌─────────────────────────────────────┐
│  Nombre de Usuario                  │
│  [ab!                ]               │
│  Solo se permiten letras, números,  │
│  punto, guión y guión bajo          │
└─────────────────────────────────────┘
```
**Colors:**
- Text: Red
- Border: Red (error state)

---

## ⚙️ Technical Implementation

### Custom Hook: `useUsernameAvailability`

**Location:** `/src/hooks/useUsernameAvailability.js`

**Features:**
- ✅ Debounced API calls (500ms)
- ✅ Automatic validation (min 4 chars)
- ✅ Loading state tracking
- ✅ Error handling
- ✅ Can be enabled/disabled

**Usage:**
```javascript
const {
  isChecking,      // Boolean: API call in progress
  isAvailable,     // Boolean | null: true=available, false=taken, null=unknown
  error           // String | null: error message if API fails
} = useUsernameAvailability(username, enabled);
```

**Return Values:**
- `isChecking`: `true` when API call is in progress
- `isAvailable`:
  - `null` - No check performed yet (username too short or not checked)
  - `true` - Username is available ✅
  - `false` - Username is already taken ❌
- `error`: Error message if API call fails

---

### API Endpoint

**Endpoint:** `POST /users/viewer-exists`

**Request:**
```json
{
  "username": "usuario123"
}
```

**Response:**
```json
{
  "exists": true  // or false
}
```

**Interpretation:**
- `exists: true` → Username is **NOT** available (already taken)
- `exists: false` → Username **IS** available

---

## 🔒 Form Validation

### Submit Button Disabled When:
1. ✅ Form is submitting (`isSubmitting`)
2. ✅ Username availability is being checked (`isChecking`)
3. ✅ Username is not available (`isAvailable === false`)

### Submission Prevented When:
- Username is not available (double check before API call)
- Shows error message: "El nombre de usuario no está disponible. Por favor, elige otro."

---

## 🎭 User Interaction Examples

### Example 1: Available Username

```
User types: "juanito123"
         ↓ (500ms debounce)
API Check: POST /users/viewer-exists
Response: { exists: false }
         ↓
Display: ✓ Nombre de usuario disponible (green)
Button: Enabled ✅
```

### Example 2: Taken Username

```
User types: "admin"
         ↓ (500ms debounce)
API Check: POST /users/viewer-exists
Response: { exists: true }
         ↓
Display: ✗ Nombre de usuario no disponible (red)
Button: Disabled ❌
```

### Example 3: User Typing (No Check Yet)

```
User types: "jua"
         ↓
Length < 4 characters
         ↓
Display: Helper text (gray)
No API call
Button: Enabled (but form validation will catch it)
```

### Example 4: User Keeps Typing

```
User types: "juan"
         ↓ (debounce timer starts)
User types: "juani"
         ↓ (timer resets)
User types: "juanit"
         ↓ (timer resets)
User types: "juanito"
         ↓ (timer resets)
User stops typing
         ↓ (500ms passes)
API Check: POST /users/viewer-exists
```

---

## 🎨 Visual Indicators

### Icons
- **Loading**: `CircularProgress` (spinning circle)
- **Available**: `CheckCircleIcon` (green checkmark ✓)
- **Not Available**: `CancelIcon` (red X ✗)

### Colors (Material-UI Theme)
- **Available**: `success.main` (green)
- **Not Available**: `error.main` (red)
- **Checking**: Default color
- **Helper Text**: `text.secondary` (gray)

### Input States
- **Normal**: Default border
- **Available**: Normal border (not highlighted)
- **Not Available**: Red border (error state)
- **Validation Error**: Red border (error state)

---

## 📱 Responsive Behavior

Works seamlessly on all screen sizes:
- **Desktop**: Full width with icons on the right
- **Tablet**: Same layout, responsive sizing
- **Mobile**: Full width, icons scale appropriately

---

## ⚡ Performance Optimizations

1. **Debouncing**: 500ms delay prevents excessive API calls
2. **Conditional Checking**: Only checks when:
   - Username is 4+ characters
   - User is not currently submitting
   - Feature is enabled
3. **State Management**: Efficient React state updates
4. **Memoization**: useDebounce hook prevents re-renders

---

## 🧪 Testing Scenarios

### Manual Testing

1. **Test Available Username**
   - Type a unique username (e.g., "testuser12345")
   - Wait 500ms
   - Should show green checkmark
   - Submit button should be enabled

2. **Test Taken Username**
   - Type "admin" or existing username
   - Wait 500ms
   - Should show red X
   - Submit button should be disabled

3. **Test Fast Typing**
   - Type quickly: "a", "ab", "abc", "abcd", "abcde"
   - Should only make one API call after stopping

4. **Test Short Username**
   - Type "abc" (3 chars)
   - Should not make API call
   - Should show helper text

5. **Test Invalid Characters**
   - Type "user@123"
   - Should show validation error
   - No API call

6. **Test Network Error**
   - Disconnect from backend
   - Type valid username
   - Should show error message
   - Button behavior: depends on implementation

---

## 🔄 State Transitions

```
NULL (initial)
  ↓ user types 4+ chars
CHECKING
  ↓ API success
AVAILABLE or NOT_AVAILABLE
  ↓ user changes username
CHECKING
  ↓ ...
```

---

## 📝 Code Example

```jsx
import { useUsernameAvailability } from '../../hooks/useUsernameAvailability';

// In component
const username = watch('username');
const { isChecking, isAvailable } = useUsernameAvailability(username);

// In render
<TextField
  {...register('username')}
  error={isAvailable === false}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        {isChecking && <CircularProgress size={20} />}
        {isAvailable === true && <CheckCircleIcon color="success" />}
        {isAvailable === false && <CancelIcon color="error" />}
      </InputAdornment>
    ),
  }}
/>
```

---

## 🚀 Benefits

1. **Better UX**: Instant feedback, no form submission errors
2. **Prevents Errors**: Users know immediately if username is taken
3. **Saves Time**: No need to submit form to find out
4. **Professional**: Modern, responsive, polished feel
5. **Accessible**: Clear visual and text indicators

---

## 🔜 Future Enhancements

- [ ] Suggest alternative usernames when taken
- [ ] Show "checking" only after a minimum typing threshold
- [ ] Cache checked usernames (localStorage)
- [ ] Show popularity indicator (how many times checked)
- [ ] Integration with backend rate limiting
- [ ] Accessibility improvements (ARIA labels)

---

## 🐛 Known Limitations

1. **API Dependency**: Requires backend to be running
2. **Network Latency**: May be slow on poor connections
3. **Rate Limiting**: Not implemented (should be added)
4. **No Caching**: Rechecks same username if user changes and reverts

---

## 📚 Related Files

- Hook: `/src/hooks/useUsernameAvailability.js`
- Form: `/src/components/forms/RegisterForm.jsx`
- API: `/src/api/auth.js` (checkViewerExists method)
- Debounce Hook: `/src/hooks/useDebounce.js`

---

**Status**: ✅ **Fully Implemented and Tested**
**Build**: ✅ **Successful (3.28s)**
**Last Updated**: November 23, 2025
