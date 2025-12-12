// User roles
export const USER_ROLES = {
  VIEWER: 'viewer',
  CUSTOMER: 'customer',
  SALES: 'sales',
  ADMIN: 'admin'
};

// Device conditions
export const DEVICE_CONDITIONS = {
  A_MINUS: 'A-',
  A: 'A',
  A_PLUS: 'A+',
  SEALED: 'Sealed',
  OEM: 'OEM'
};

export const DEVICE_CONDITION_LABELS = {
  'Sellado': 'Sellado (Nuevo)',
  'Usado': 'Usado',
  'ASIS': 'AS-IS (Sin garantía)',
  'OEM': 'OEM Original',
  'CPO': 'CPO (Certified Pre-Owned)'
};

// Appointment status
export const APPOINTMENT_STATUS = {
  PENDING: 'pendiente',
  CONFIRMED: 'confirmada',
  RESCHEDULED: 'reprogramada',
  CANCELLED: 'cancelada',
  COMPLETED: 'completada'
};

export const APPOINTMENT_STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  reprogramada: 'Reprogramada',
  cancelada: 'Cancelada',
  completada: 'Completada'
};

export const APPOINTMENT_STATUS_COLORS = {
  pendiente: 'warning',
  confirmada: 'success',
  reprogramada: 'info',
  cancelada: 'error',
  completada: 'default'
};

// CRM Status
export const CRM_STATUS = {
  NUEVO_LEAD: 'Nuevo lead',
  INTERESADO: 'Interesado',
  EN_EVALUACION: 'En evaluación',
  NEGOCIACION: 'Negociación/Cierre',
  VENTA_CONCRETADA: 'Venta concretada/Postventa',
  LEAD_FRIO: 'Lead frío',
  PERDIDO: 'Perdido'
};

export const CRM_STATUS_LABELS = {
  'Nuevo lead': 'Nuevo Lead',
  'Interesado': 'Interesado',
  'En evaluación': 'En Evaluación',
  'Negociación/Cierre': 'Negociación/Cierre',
  'Venta concretada/Postventa': 'Venta Concretada',
  'Lead frío': 'Lead Frío',
  'Perdido': 'Perdido'
};

export const CRM_STATUS_COLORS = {
  'Nuevo lead': 'info',
  'Interesado': 'primary',
  'En evaluación': 'warning',
  'Negociación/Cierre': 'secondary',
  'Venta concretada/Postventa': 'success',
  'Lead frío': 'default',
  'Perdido': 'error'
};

export const REDES_SOCIALES = [
  'Instagram',
  'Facebook',
  'WhatsApp',
  'Teléfono',
  'Email',
  'Presencial',
  'Web',
  'Otro'
];

export const RED_SOCIAL_ICONS = {
  'Instagram': 'Instagram',
  'Facebook': 'Facebook',
  'WhatsApp': 'WhatsApp',
  'Teléfono': 'Phone',
  'Email': 'Email',
  'Presencial': 'Person',
  'Web': 'Language',
  'Otro': 'MoreHoriz'
};

// Reservation status
export const RESERVATION_STATUS = {
  PENDING_PAYMENT: 'pendiente_pago',
  PENDING_APPROVAL: 'pendiente_aprobacion',
  CONFIRMED: 'confirmada',
  REJECTED: 'rechazada',
  COMPLETED: 'completada',
  EXPIRED: 'expirada'
};

export const RESERVATION_STATUS_LABELS = {
  pendiente_pago: 'Pendiente de Pago',
  pendiente_aprobacion: 'Pendiente de Aprobación',
  confirmada: 'Confirmada',
  rechazada: 'Rechazada',
  completada: 'Completada',
  expirada: 'Expirada'
};

export const RESERVATION_STATUS_COLORS = {
  pendiente_pago: 'warning',
  pendiente_aprobacion: 'info',
  confirmada: 'success',
  rechazada: 'error',
  completada: 'default',
  expirada: 'error'
};

// Storage options
// export const STORAGE_OPTIONS = [
//   { value: 64, label: '64GB' },
//   { value: 128, label: '128GB' },
//   { value: 256, label: '256GB' },
//   { value: 512, label: '512GB' },
//   { value: 1024, label: '1TB' }
// ];

// Battery health ranges
export const BATTERY_HEALTH_RANGES = [
  { value: '100-100', label: '100%' },
  { value: '95-99', label: '95% - 99%' },
  { value: '90-94', label: '90% - 94%' },
  { value: '85-89', label: '85% - 89%' },
  { value: '80-84', label: '80% - 84%' },
  { value: '75-79', label: '75% - 79%' },
  { value: '0-74', label: 'Menos de 75%' }
];

// Time constants
export const RESERVATION_UPLOAD_TIMEOUT = 3600000; // 1 hour in milliseconds
export const RESERVATION_VALIDITY = 7; // 7 days
export const APPOINTMENT_MIN_ADVANCE_HOURS = 12;
export const APPOINTMENT_REMINDER_HOURS = 3;
export const CURRENCY_CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

// API endpoints paths
export const API_PATHS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',

  // Users
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/change-password',

  // Customers
  CUSTOMERS: '/clientes',

  // Products & Devices
  COLORS: '/api/colores',
  PRODUCTS: '/api/productos',
  DEVICES: '/api/equipos',

  // Appointments
  APPOINTMENTS: '/agenda',
  AVAILABILITY: '/agenda/availability',

  // Branches
  BRANCHES: '/api/v1/sucursales',

  // Trade-ins (Canjes)
  CANJES: '/api/v1/canjes',
  TRADE_INS: '/api/v1/canjes',
  TRADE_IN_VALUATE: '/api/v1/canjes/valuate',

  // Reservations
  RESERVATIONS: '/reservas',

  // Bank Accounts
  BANK_ACCOUNTS: '/cuentas-bancarias',

  // CRM
  CRM: '/api/v1/crm'
};

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  TRADE_IN_DEVICE: 'trade_in_device',
  CURRENCY_RATE: 'currency_rate',
  CURRENCY_RATE_TIMESTAMP: 'currency_rate_timestamp'
};

// File upload
export const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp']
};

export const ACCEPTED_PAYMENT_PROOF_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf']
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_DEVICE = 10;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/registro',

  // Public
  DEVICES: '/dispositivos',
  DEVICE_DETAIL: '/dispositivo/:id',

  // Customer
  PROFILE: '/perfil',
  MY_APPOINTMENTS: '/mis-citas',
  MY_RESERVATIONS: '/mis-reservas',

  // Appointments
  BOOK_APPOINTMENT: '/agendar/:deviceId?',

  // Reservations
  MAKE_RESERVATION: '/reservar/:deviceId',

  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PRODUCTS: '/admin/productos',
  ADMIN_DEVICES: '/admin/dispositivos',
  ADMIN_TRADE_INS: '/admin/canjes',
  ADMIN_BANK_ACCOUNTS: '/admin/cuentas',
  ADMIN_BRANCHES: '/admin/sucursales',

  // Sales
  SALES_DASHBOARD: '/ventas',
  SALES_APPOINTMENTS: '/ventas/citas',
  SALES_RESERVATIONS: '/ventas/reservas',
  SALES_DEVICES: '/ventas/dispositivos',
  SALES_AVAILABILITY: '/ventas/disponibilidad',

  // CRM
  CRM_LIST: '/crm',
  CRM_DETAIL: '/crm/:id'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu conexión a internet.',
  UNAUTHORIZED: 'No tienes autorización para realizar esta acción.',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  SERVER_ERROR: 'Error del servidor. Por favor, intenta nuevamente más tarde.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  FILE_TOO_LARGE: 'El archivo es demasiado grande. Tamaño máximo: 5MB.',
  INVALID_FILE_TYPE: 'Tipo de archivo no válido.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Inicio de sesión exitoso',
  LOGOUT: 'Sesión cerrada exitosamente',
  REGISTER: 'Registro exitoso',
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
  PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
  APPOINTMENT_BOOKED: 'Cita agendada exitosamente',
  APPOINTMENT_CANCELLED: 'Cita cancelada exitosamente',
  RESERVATION_CREATED: 'Reserva creada exitosamente',
  PAYMENT_PROOF_UPLOADED: 'Comprobante de pago subido exitosamente',
  ITEM_CREATED: 'Elemento creado exitosamente',
  ITEM_UPDATED: 'Elemento actualizado exitosamente',
  ITEM_DELETED: 'Elemento eliminado exitosamente'
};
