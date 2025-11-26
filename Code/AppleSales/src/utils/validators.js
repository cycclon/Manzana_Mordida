import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Email inválido');

/**
 * Username validation schema (matching backend)
 */
export const usernameSchema = z
  .string()
  .min(4, 'El nombre de usuario debe tener al menos 4 caracteres')
  .regex(
    /^[a-zA-Z0-9._-]{4,}$/,
    'Solo se permiten letras, números, punto, guión y guión bajo'
  );

/**
 * Password validation schema (matching backend)
 */
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

/**
 * Phone/WhatsApp number validation schema
 */
export const whatsappSchema = z
  .string()
  .min(10, 'Número de WhatsApp inválido')
  .regex(/^[0-9+\s()-]+$/, 'Formato de número inválido');

/**
 * Login form schema (username + password)
 */
export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
});

/**
 * Register form schema (matching backend User + Cliente models)
 */
export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: emailSchema,
  whatsapp: whatsappSchema.optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword'],
});

/**
 * Profile update schema (for customers - only email and whatsapp editable)
 */
export const profileSchema = z.object({
  email: emailSchema,
  whatsapp: whatsappSchema.optional(),
});

/**
 * Customer creation schema (matching backend Cliente model)
 */
export const customerSchema = z.object({
  nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: emailSchema,
  whatsapp: whatsappSchema.optional(),
  usuario: usernameSchema, // Links to User model
});

/**
 * Device schema
 */
export const deviceSchema = z.object({
  productId: z.string().min(1, 'El producto es requerido'),
  condition: z.enum(['A-', 'A', 'A+', 'Sealed', 'OEM'], {
    errorMap: () => ({ message: 'Condición inválida' }),
  }),
  batteryHealth: z.number().min(0).max(100, 'El porcentaje debe estar entre 0 y 100'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  serialNumber: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
});

/**
 * Product schema
 */
export const productSchema = z.object({
  model: z.string().min(1, 'El modelo es requerido'),
  brand: z.string().default('Apple'),
  storage: z.number().positive('La capacidad debe ser mayor a 0'),
  category: z.string().min(1, 'La categoría es requerida'),
  description: z.string().optional(),
});

/**
 * Trade-in schema
 */
export const tradeInSchema = z.object({
  model: z.string().min(1, 'El modelo es requerido'),
  storage: z.number().positive('La capacidad es requerida'),
  minBatteryHealth: z.number().min(0).max(100),
  maxBatteryHealth: z.number().min(0).max(100),
  price: z.number().positive('El precio debe ser mayor a 0'),
}).refine((data) => data.maxBatteryHealth >= data.minBatteryHealth, {
  message: 'La batería máxima debe ser mayor o igual a la mínima',
  path: ['maxBatteryHealth'],
});

/**
 * Branch schema
 */
export const branchSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  phone: whatsappSchema,
  email: emailSchema.optional(),
  workingHours: z.string().optional(),
});

/**
 * Bank account schema
 */
export const bankAccountSchema = z.object({
  bankName: z.string().min(1, 'El nombre del banco es requerido'),
  accountType: z.enum(['Caja de Ahorro', 'Cuenta Corriente'], {
    errorMap: () => ({ message: 'Tipo de cuenta inválido' }),
  }),
  accountNumber: z.string().min(1, 'El número de cuenta es requerido'),
  cbu: z.string().length(22, 'El CBU debe tener 22 dígitos'),
  alias: z.string().optional(),
  holderName: z.string().min(1, 'El titular es requerido'),
});

/**
 * Appointment schema
 */
export const appointmentSchema = z.object({
  deviceId: z.string().optional(),
  branchId: z.string().min(1, 'La sucursal es requerida'),
  dateTime: z.date({
    required_error: 'La fecha y hora son requeridas',
  }),
  notes: z.string().optional(),
});

/**
 * Reservation schema
 */
export const reservationSchema = z.object({
  deviceId: z.string().min(1, 'El dispositivo es requerido'),
  notes: z.string().optional(),
});

/**
 * Validate file type
 */
export const validateFileType = (file, acceptedTypes) => {
  return Object.keys(acceptedTypes).includes(file.type);
};

/**
 * Validate file size
 */
export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};
