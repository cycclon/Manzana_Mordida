# Routing & Navigation Guide

## 🗺️ Application Routes

### Public Routes (No authentication required)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | HomePage | Main marketplace/landing page |
| `/login` | LoginPage | Login form (redirects if authenticated) |
| `/registro` | RegisterPage | Registration form for viewers (redirects if authenticated) |
| `/dispositivos` | DevicesPage | Browse all devices (placeholder) |
| `/dispositivo/:id` | DeviceDetailPage | Device details (placeholder) |

### Protected Routes (Authentication required)

#### Customer/Viewer Routes
| Path | Component | Allowed Roles | Description |
|------|-----------|---------------|-------------|
| `/perfil` | ProfilePage | All roles | User profile & settings |
| `/mis-citas` | MyAppointmentsPage | viewer, customer | View my appointments |
| `/mis-reservas` | MyReservationsPage | viewer, customer | View my reservations |
| `/agendar/:deviceId?` | BookAppointmentPage | All authenticated | Book appointment for a device |
| `/reservar/:deviceId` | MakeReservationPage | All authenticated | Reserve a device with down-payment |

#### Admin Routes
| Path | Component | Allowed Roles | Description |
|------|-----------|---------------|-------------|
| `/admin` | AdminDashboard | admin | Admin dashboard overview |
| `/admin/productos` | AdminProductsPage | admin | Manage products (classes) |
| `/admin/dispositivos` | AdminDevicesPage | admin | Manage devices (instances) |
| `/admin/canjes` | AdminTradeInsPage | admin | Manage trade-in valuations |
| `/admin/cuentas` | AdminBankAccountsPage | admin | Manage bank accounts |
| `/admin/sucursales` | AdminBranchesPage | admin | Manage business branches |

#### Sales Routes
| Path | Component | Allowed Roles | Description |
|------|-----------|---------------|-------------|
| `/ventas` | SalesDashboard | sales, admin | Sales dashboard overview |
| `/ventas/citas` | SalesAppointmentsPage | sales, admin | Manage appointments |
| `/ventas/reservas` | SalesReservationsPage | sales, admin | Approve/reject reservations |
| `/ventas/dispositivos` | SalesDevicesPage | sales, admin | Manage device inventory |
| `/ventas/disponibilidad` | SalesAvailabilityPage | sales, admin | Set availability schedule |

### Special Routes

| Path | Component | Description |
|------|-----------|-------------|
| `*` | NotFoundPage | 404 error page for undefined routes |

---

## 🔐 Route Protection

### ProtectedRoute Component
Wraps routes that require authentication. Redirects to `/login` if user is not authenticated.

```jsx
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

### RoleBasedRoute Component
Wraps routes that require specific user roles. Shows "Access Denied" page if user doesn't have permission.

```jsx
<RoleBasedRoute allowedRoles={[USER_ROLES.ADMIN]}>
  <AdminComponent />
</RoleBasedRoute>
```

### PublicRoute Component
Wraps login/register pages. Redirects to `/` if user is already authenticated.

```jsx
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

---

## 🎭 User Roles

### Defined Roles (from constants)
- **viewer**: Regular customer browsing/buying
- **customer**: Same as viewer but with customer profile created
- **sales**: Sales representative
- **admin**: Administrator with full access

### Role Hierarchy
- **Public**: Anyone (no authentication)
- **Viewer/Customer**: Authenticated users who can browse, book appointments, reserve devices
- **Sales**: Can manage appointments, reservations, and inventory
- **Admin**: Full access to all features including user management, trade-ins, branches, bank accounts

---

## 🧭 Navigation Examples

### Programmatic Navigation

```jsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/login');
  };

  const goToDeviceDetail = (deviceId) => {
    navigate(`/dispositivo/${deviceId}`);
  };

  const goBack = () => {
    navigate(-1); // Go back one page
  };
}
```

### Link Navigation

```jsx
import { Link } from 'react-router-dom';

<Link to="/dispositivos">Ver Dispositivos</Link>
<Link to={`/dispositivo/${device.id}`}>Ver Detalles</Link>
```

### MUI Button Navigation

```jsx
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate('/login')}>
      Iniciar Sesión
    </Button>
  );
}
```

---

## 📱 Layout Structure

All routes use the `MainLayout` component which provides:
- **Header**: Sticky navigation bar with logo, menu, user profile
- **Main Content**: Page content (via `<Outlet />`)
- **Footer**: Company info, contact, links

```
┌─────────────────────────────────┐
│         Header (Sticky)         │ ← Navigation, user menu
├─────────────────────────────────┤
│                                 │
│        Main Content Area        │ ← Page components
│         (Flex: grow)            │
│                                 │
├─────────────────────────────────┤
│            Footer               │ ← Company info, contact
└─────────────────────────────────┘
```

---

## 🔑 Authentication Flow

### Login Flow
1. User visits `/login`
2. Submits credentials
3. On success:
   - Tokens stored in localStorage
   - User data stored in Zustand
   - Redirected to original destination or `/`
4. On failure:
   - Error message shown
   - Stays on login page

### Logout Flow
1. User clicks "Cerrar Sesión" in header menu
2. Logout API called
3. Tokens removed from localStorage
4. Zustand store cleared
5. Redirected to `/login`

### Protected Route Access
1. User tries to access protected route
2. `ProtectedRoute` checks authentication
3. If not authenticated → redirect to `/login` with return URL
4. If authenticated but wrong role → show "Access Denied"
5. If authenticated with correct role → show page

---

## 🎨 Header Navigation

The header dynamically changes based on authentication status:

### Not Authenticated
- Logo/Brand
- "Inicio" button
- "Dispositivos" button
- "Iniciar Sesión" button
- "Registrarse" button

### Authenticated (Viewer/Customer)
- Logo/Brand
- "Inicio" button
- "Dispositivos" button
- User avatar/menu:
  - Mi Perfil
  - Cerrar Sesión

### Authenticated (Sales)
- Logo/Brand
- "Inicio" button
- "Dispositivos" button
- User avatar/menu:
  - Mi Perfil
  - Panel Ventas
  - Cerrar Sesión

### Authenticated (Admin)
- Logo/Brand
- "Inicio" button
- "Dispositivos" button
- User avatar/menu:
  - Mi Perfil
  - Panel Admin
  - Panel Ventas
  - Cerrar Sesión

---

## 🚀 Adding New Routes

### Step 1: Create Page Component
```jsx
// src/pages/public/NewPage.jsx
export const NewPage = () => {
  return <div>New Page Content</div>;
};
export default NewPage;
```

### Step 2: Add Route to Router
```jsx
// src/router/index.jsx
import NewPage from '../pages/public/NewPage';

// Add to routes array:
{
  path: 'new-page',
  element: <NewPage />,
}
```

### Step 3: Add Navigation Link (if needed)
```jsx
// In Header.jsx or other component
<Button onClick={() => navigate('/new-page')}>
  New Page
</Button>
```

---

## 📝 Route Parameters

### Dynamic Segments
```jsx
// Route definition
{
  path: 'dispositivo/:id',
  element: <DeviceDetailPage />,
}

// Access in component
import { useParams } from 'react-router-dom';

function DeviceDetailPage() {
  const { id } = useParams();
  // id contains the device ID from URL
}
```

### Optional Parameters
```jsx
// Route with optional parameter
{
  path: 'agendar/:deviceId?',
  element: <BookAppointmentPage />,
}

// Access in component
const { deviceId } = useParams();
// deviceId may be undefined
```

### Query Parameters
```jsx
// Navigate with query params
navigate('/dispositivos?category=iphone&storage=256');

// Access in component
import { useSearchParams } from 'react-router-dom';

function DevicesPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category'); // 'iphone'
  const storage = searchParams.get('storage');   // '256'
}
```

---

## ⚡ Performance Tips

1. **Lazy Loading**: Routes can be lazy loaded to reduce initial bundle size
2. **Prefetching**: Use `<Link prefetch>` for important routes
3. **Route Splitting**: Each major section (admin, sales, customer) can have its own bundle

---

## 🧪 Testing Routes

```bash
# Start dev server
npm run dev

# Test routes manually:
http://localhost:5173/           # Home
http://localhost:5173/login      # Login
http://localhost:5173/registro   # Register
http://localhost:5173/perfil     # Profile (requires auth)
http://localhost:5173/admin      # Admin (requires admin role)
```

---

## 🔧 Troubleshooting

### Route not working?
1. Check router configuration in `src/router/index.jsx`
2. Ensure component is imported correctly
3. Check for typos in path
4. Verify protection wrappers are correct

### Access denied on valid route?
1. Check user role in localStorage/Zustand
2. Verify `allowedRoles` array in RoleBasedRoute
3. Check authentication status

### Redirect loop?
1. Check PublicRoute on login/register pages
2. Verify ProtectedRoute logic
3. Check initial auth state in Zustand

---

**Note**: All routes are configured in `/src/router/index.jsx`. Modify this file to add, remove, or change routes.
