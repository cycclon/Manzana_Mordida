# Manzana Mordida - Frontend React

Frontend application for the Manzana Mordida (AppleSales) e-commerce platform built with React + Vite.

## 🚀 Tech Stack

- **React 19.1.0** - UI library
- **Vite 7.0.4** - Build tool & dev server
- **Material-UI (MUI)** - Component library & design system
- **Zustand** - State management
- **React Router** - Client-side routing
- **React Hook Form + Zod** - Form handling & validation
- **Axios** - HTTP client with JWT interceptors
- **Swiper** - Image carousels
- **React Hot Toast** - Notifications
- **date-fns** - Date utilities
- **js-cookie** - Cookie management

## 📁 Project Structure

```
AppleSales/
├── src/
│   ├── api/                    # API clients for microservices
│   │   ├── client.js          # Axios base config with JWT refresh
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── products.js        # Products & devices endpoints
│   │   ├── customers.js       # Customer management
│   │   ├── appointments.js    # Appointment scheduling
│   │   ├── reservations.js    # Reservations & payments
│   │   ├── tradeIns.js        # Trade-in valuations
│   │   ├── branches.js        # Branch locations
│   │   └── bankAccounts.js    # Bank accounts
│   │
│   ├── components/
│   │   ├── layout/            # Header, Footer, Sidebar
│   │   ├── common/            # Reusable components
│   │   ├── devices/           # Device-related components
│   │   ├── forms/             # Form components
│   │   ├── admin/             # Admin panel components
│   │   ├── appointments/      # Appointment components
│   │   └── reservations/      # Reservation components
│   │
│   ├── pages/
│   │   ├── public/            # Public pages (home, login, register)
│   │   ├── customer/          # Customer dashboard
│   │   ├── admin/             # Admin panel
│   │   └── sales/             # Sales dashboard
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.js         # Authentication hook
│   │   ├── useCurrency.js     # Currency conversion
│   │   ├── useTradeIn.js      # Trade-in functionality
│   │   ├── useDebounce.js     # Debounce hook
│   │   └── useCountdown.js    # Countdown timer
│   │
│   ├── store/                 # Zustand state stores
│   │   ├── authStore.js       # User authentication state
│   │   ├── currencyStore.js   # Exchange rates
│   │   ├── tradeInStore.js    # Trade-in calculator
│   │   └── uiStore.js         # UI state (modals, menus, etc.)
│   │
│   ├── utils/                 # Utility functions
│   │   ├── formatters.js      # Currency, date, text formatters
│   │   ├── validators.js      # Zod validation schemas
│   │   └── helpers.js         # General helpers
│   │
│   ├── constants/
│   │   └── index.js           # App constants, routes, messages
│   │
│   ├── theme.js               # MUI theme configuration
│   ├── App.jsx                # Root component
│   └── main.jsx               # App entry point
│
├── .env                       # Environment variables
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# API Base URLs - Microservices
VITE_API_SEGURIDAD=http://localhost:3002
VITE_API_PRODUCTOS=http://localhost:3001
VITE_API_CLIENTES=http://localhost:3003
VITE_API_AGENDA=http://localhost:3004
VITE_API_SUCURSALES=http://localhost:3005
VITE_API_CANJES=http://localhost:3006
VITE_API_RESERVAS=http://localhost:3007
VITE_API_CUENTAS_BANCARIAS=http://localhost:3009

# External APIs
VITE_DOLAR_API=https://dolarapi.com/v1/dolares/blue

# Cloudflare R2 Configuration
VITE_R2_ENDPOINT=
VITE_R2_REGION=
VITE_R2_ACCESS_KEY_ID=
VITE_R2_SECRET_ACCESS_KEY=
VITE_R2_BUCKET_NAME=

# App Configuration
VITE_APP_NAME=Manzana Mordida
VITE_RESERVATION_UPLOAD_TIMEOUT=3600000
VITE_CURRENCY_CACHE_DURATION=3600000
```

## 🎯 Available Scripts

```bash
# Install dependencies
npm install

# Run development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔐 Authentication Flow

The app uses JWT-based authentication with automatic token refresh:

1. User logs in via `/auth/login` (msSeguridad)
2. Receives `accessToken` (15 min) and `refreshToken` (7 days)
3. Tokens stored in localStorage & httpOnly cookies
4. Axios interceptor auto-refreshes expired access tokens
5. On refresh failure, user is logged out and redirected to login

## 💱 Currency System

- **Primary**: USD (larger display)
- **Secondary**: ARS (smaller display)
- **Exchange Rate**: Fetched from DolarAPI (blue "venta" rate)
- **Cache Duration**: 1 hour
- **Auto-refresh**: On mount and cache expiration

## 🛍️ Trade-In Calculator

Users can input their device specs to see adjusted prices:
- Device selection (model, storage, battery %)
- Real-time valuation via `/canjes/valuate`
- Sticky header display
- Prices shown as: `Device Price - Trade-In Value`

## 📅 Key Features

### Public Features
- **Device Marketplace**: Search, filter, view devices
- **Device Detail**: Image carousel, specs, pricing
- **Trade-In Calculator**: Get instant valuations
- **Appointment Booking**: Schedule visits to branches
- **Reservations**: Reserve devices with down-payment

### Customer Features
- **Profile Management**: Edit personal info
- **My Appointments**: View/cancel appointments
- **My Reservations**: Track reservation status

### Sales Features
- **Calendar Dashboard**: Manage appointments
- **Availability Settings**: Set working hours
- **Reservation Approval**: Confirm/reject reservations
- **Stock Management**: Same as admin devices

### Admin Features
- **Products & Devices CRUD**
- **Trade-In Valuations**
- **Branch Management**
- **Bank Account Management**
- **User Management**

## 🎨 UI Guidelines

- **Language**: Spanish
- **Icons**: Use liberally for better UX
- **Currency Display**: USD prominent, ARS secondary
- **Responsive**: Mobile-first design
- **Accessibility**: ARIA labels, keyboard navigation

## 🔗 Microservices Integration

### msSeguridad (Port 3002)
- Authentication, user management, JWT tokens

### msProductos (Port 3001)
- Products (classes) and equipos (device instances)
- Image uploads to Cloudflare R2

### msClientes (Port 3003)
- Customer profiles linked to viewer users

### msAgenda (Port 3004)
- Appointment scheduling and availability

### msSucursales (Port 3005)
- Business branch locations

### msCanjes (Port 3006)
- Trade-in device valuations

### msReservas (Port 3007)
- Device reservations and down-payments

### msCuentasBancarias (Port 3009)
- Bank account information for payments

## 📦 State Management

### Auth Store
- User session, login/logout, role-based access

### Currency Store
- Exchange rates, USD/ARS conversion, caching

### Trade-In Store
- Selected device, valuation, price adjustments

### UI Store
- Modals, mobile menu, loading states, filters

## 🛠️ Development Guidelines

1. **API Calls**: Use the provided API clients in `/src/api/`
2. **State**: Use Zustand stores for global state
3. **Forms**: Use React Hook Form + Zod schemas
4. **Styling**: Use MUI's `sx` prop or styled components
5. **Icons**: Use `@mui/icons-material`
6. **Date Formatting**: Use `date-fns` with Spanish locale
7. **Notifications**: Use `react-hot-toast`

## 🚧 Development Roadmap

- [x] Project setup & dependencies
- [ ] Configure routing
- [ ] Build layout components (Header, Footer)
- [ ] Authentication pages (Login, Register)
- [ ] Main marketplace page
- [ ] Device detail page
- [ ] Trade-in calculator UI
- [ ] Appointment booking system
- [ ] Reservation flow
- [ ] Customer dashboard
- [ ] Admin panel CRUD
- [ ] Sales dashboard
- [ ] Responsive design
- [ ] Testing & optimization

## 📝 Notes

- All microservices must be running for full functionality
- MongoDB must be accessible on port 27018
- Swagger docs available at each service's `/api-docs` endpoint
- Payment handling is done via bank transfer proof upload
- Images stored in Cloudflare R2

## 🤝 Contributing

1. Follow the existing code structure
2. Use Spanish for all UI text
3. Maintain TypeScript-like patterns with JSDoc
4. Test with all user roles (viewer, sales, admin)
5. Ensure responsive design on mobile/tablet/desktop

---

**Manzana Mordida** - Compra y venta de dispositivos Apple reacondicionados
