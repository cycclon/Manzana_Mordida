import { baseAPI } from './client';

const CITAS_PATH = '/api/v1/citas';
const HORARIOS_PATH = '/api/v1/horarios';

export const appointmentsAPI = {
  // Public endpoints - Get available appointment slots (anonymous - shows only date/time, no client info)
  getAvailableSlots: async (fecha, sucursal) => {
    const response = await baseAPI.get(`${CITAS_PATH}/anonimas/${fecha}/${sucursal}`);
    return response.data;
  },

  // Get available slots for date range
  getAvailableSlotsRange: async (fechaDesde, fechaHasta, sucursal) => {
    const response = await baseAPI.get(`${CITAS_PATH}/anonimas/${fechaDesde}/${fechaHasta}/${sucursal}`);
    return response.data;
  },

  // Request an appointment (public)
  // appointmentData: { cliente: { nombre, email?, telefono?, canje? }, fecha, sucursal, horaInicio, duracion? }
  requestAppointment: async (appointmentData) => {
    const response = await baseAPI.post(`${CITAS_PATH}/solicitar`, appointmentData);
    return response.data;
  },

  // Cancel an appointment
  // cancelacionData: { motivo }
  cancelAppointment: async (appointmentId, cancelacionData) => {
    const response = await baseAPI.post(`${CITAS_PATH}/cancelar/${appointmentId}`, cancelacionData);
    return response.data;
  },

  // Reschedule an appointment
  // newAppointmentData: { fecha, horaInicio, duracion?, sucursal }
  rescheduleAppointment: async (appointmentId, newAppointmentData) => {
    const response = await baseAPI.post(`${CITAS_PATH}/reprogramar/${appointmentId}`, newAppointmentData);
    return response.data;
  },

  // Accept a rescheduled appointment (public - viewer can accept)
  // acceptData: { email: string }
  acceptAppointment: async (appointmentId, email) => {
    const response = await baseAPI.post(`${CITAS_PATH}/aceptar/${appointmentId}`, { email });
    return response.data;
  },

  // Admin/Sales endpoints (require authentication)

  // Get appointments for a specific date (with full details)
  getAppointmentsByDate: async (fecha) => {
    const response = await baseAPI.get(`${CITAS_PATH}/${fecha}`);
    return response.data;
  },

  // Get appointments for a date range (with full details) - admin/sales only
  // Optional vendedor query param to filter by seller
  getAppointmentsByRange: async (fechaDesde, fechaHasta, vendedor = null) => {
    const url = `${CITAS_PATH}/rango/${fechaDesde}/${fechaHasta}`;
    const response = await baseAPI.get(url, {
      params: vendedor ? { vendedor } : {}
    });
    return response.data;
  },

  // Confirm an appointment (admin/sales only)
  confirmAppointment: async (appointmentId) => {
    const response = await baseAPI.post(`${CITAS_PATH}/confirmar/${appointmentId}`);
    return response.data;
  },

  // Get horarios (available time windows) for a branch
  getHorariosBySucursal: async (sucursal) => {
    const response = await baseAPI.get(`${HORARIOS_PATH}/sucursal/${sucursal}`);
    return response.data;
  },

  // Get appointments for current user (by email)
  getMyAppointments: async (email) => {
    const response = await baseAPI.get(`${CITAS_PATH}/mis-citas`, {
      params: { email },
    });
    return response.data;
  },
};

export default appointmentsAPI;
