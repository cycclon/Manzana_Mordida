import { createBrowserRouter, Navigate } from 'react-router-dom';
import { USER_ROLES } from '../constants';

// Route Components
import { ProtectedRoute } from '../components/routes/ProtectedRoute';
import { RoleBasedRoute } from '../components/routes/RoleBasedRoute';
import { PublicRoute } from '../components/routes/PublicRoute';

// Layout Components (to be created)
import MainLayout from '../components/layout/MainLayout';

// Public Pages
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import DevicesPage from '../pages/public/DevicesPage';
import DeviceDetailPage from '../pages/public/DeviceDetailPage';
import BookAppointmentPage from '../pages/public/BookAppointmentPage';

// Customer Pages
import ProfilePage from '../pages/customer/ProfilePage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';

// Sales Pages
import SalesDashboard from '../pages/sales/SalesDashboard';

// Other Pages
import NotFoundPage from '../pages/NotFoundPage';

/**
 * Application Router Configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      // Public Routes
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: 'registro',
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },

      // Device Routes (Public)
      {
        path: 'dispositivos',
        element: <DevicesPage />,
      },
      {
        path: 'dispositivo/:id',
        element: <DeviceDetailPage />,
      },

      // Protected Customer Routes
      {
        path: 'perfil',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'mis-citas',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.VIEWER, USER_ROLES.CUSTOMER]}>
              <div>Mis Citas Page - En construcción</div>
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'mis-reservas',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.VIEWER, USER_ROLES.CUSTOMER]}>
              <div>Mis Reservas Page - En construcción</div>
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
      },

      // Appointment Routes
      {
        path: 'agendar/:deviceId?',
        element: <BookAppointmentPage />,
      },

      // Reservation Routes
      {
        path: 'reservar/:deviceId',
        element: (
          <ProtectedRoute>
            <div>Make Reservation Page - En construcción</div>
          </ProtectedRoute>
        ),
      },

      // Admin Routes
      {
        path: 'admin',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <AdminDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/productos',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <div>Admin Products Page - En construcción</div>
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/dispositivos',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <div>Admin Devices Page - En construcción</div>
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/canjes',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <div>Admin Trade-ins Page - En construcción</div>
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/cuentas',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <div>Admin Bank Accounts Page - En construcción</div>
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/sucursales',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <div>Admin Branches Page - En construcción</div>
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
      },

      // Sales Routes
      {
        path: 'ventas',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.SALES, USER_ROLES.ADMIN]}>
              <SalesDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'ventas/citas',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.SALES, USER_ROLES.ADMIN]}>
              <div>Sales Appointments Page - En construcción</div>
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'ventas/reservas',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.SALES, USER_ROLES.ADMIN]}>
              <div>Sales Reservations Page - En construcción</div>
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'ventas/dispositivos',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.SALES, USER_ROLES.ADMIN]}>
              <div>Sales Devices Page - En construcción</div>
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'ventas/disponibilidad',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.SALES, USER_ROLES.ADMIN]}>
              <div>Sales Availability Page - En construcción</div>
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
      },

      // Catch-all 404
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
