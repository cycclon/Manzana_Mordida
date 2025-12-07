import { agendaAPI } from './client';

export const appointmentsAPI = {
  // Public endpoints - Get available appointment slots (anonymous - shows only date/time, no client info)
  getAvailableSlots: async (fecha, sucursal) => {
    const response = await agendaAPI.get(`/api/v1/citas/anonimas/${fecha}/${sucursal}`);
    return response.data;
  },

  // Get available slots for date range
  getAvailableSlotsRange: async (fechaDesde, fechaHasta, sucursal) => {
    const response = await agendaAPI.get(`/api/v1/citas/anonimas/${fechaDesde}/${fechaHasta}/${sucursal}`);
    return response.data;
  },

  // Request an appointment (public)
  // appointmentData: { cliente: { nombre, email?, telefono?, canje? }, fecha, sucursal, horaInicio, duracion? }
  requestAppointment: async (appointmentData) => {
    const response = await agendaAPI.post('/api/v1/citas/solicitar', appointmentData);
    return response.data;
  },

  // Cancel an appointment
  // cancelacionData: { motivo }
  cancelAppointment: async (appointmentId, cancelacionData) => {
    const response = await agendaAPI.post(`/api/v1/citas/cancelar/${appointmentId}`, cancelacionData);
    return response.data;
  },

  // Reschedule an appointment
  // newAppointmentData: { fecha, horaInicio, duracion?, sucursal }
  rescheduleAppointment: async (appointmentId, newAppointmentData) => {
    const response = await agendaAPI.post(`/api/v1/citas/reprogramar/${appointmentId}`, newAppointmentData);
    return response.data;
  },

  // Accept a rescheduled appointment (public - viewer can accept)
  // acceptData: { email: string }
  acceptAppointment: async (appointmentId, email) => {
    const response = await agendaAPI.post(`/api/v1/citas/aceptar/${appointmentId}`, { email });
    return response.data;
  },

  // Admin/Sales endpoints (require authentication)

  // Get appointments for a specific date (with full details)
  getAppointmentsByDate: async (fecha) => {
    const response = await agendaAPI.get(`/api/v1/citas/${fecha}`);
    return response.data;
  },

  // Get appointments for a date range (with full details) - admin/sales only
  // Optional vendedor query param to filter by seller
  getAppointmentsByRange: async (fechaDesde, fechaHasta, vendedor = null) => {
    const url = `/api/v1/citas/rango/${fechaDesde}/${fechaHasta}`;
    const response = await agendaAPI.get(url, {
      params: vendedor ? { vendedor } : {}
    });
    return response.data;
  },

  // Confirm an appointment (admin/sales only)
  confirmAppointment: async (appointmentId) => {
    const response = await agendaAPI.post(`/api/v1/citas/confirmar/${appointmentId}`);
    return response.data;
  },

  // Get horarios (available time windows) for a branch
  getHorariosBySucursal: async (sucursal) => {
    const response = await agendaAPI.get(`/api/v1/horarios/sucursal/${sucursal}`);
    return response.data;
  },

  // Get appointments for current user (by email)
  getMyAppointments: async (email) => {
    const response = await agendaAPI.get('/api/v1/citas/mis-citas', {
      params: { email },
    });
    return response.data;
  },
};

export default appointmentsAPI;
