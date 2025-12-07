import { reservasAPI } from './client';

export const reservationsAPI = {
  // Calculate deposit amount (seña)
  calculateDeposit: async (monto) => {
    const response = await reservasAPI.post('/api/v1/reservas/calcular-sena', { monto });
    return response.data;
  },

  // Get all reservations
  getAllReservations: async (params) => {
    const response = await reservasAPI.get('/api/v1/reservas/', { params });
    return response.data;
  },

  // Get active reservations (not cancelled or expired)
  getActiveReservations: async () => {
    const response = await reservasAPI.get('/api/v1/reservas/', {
      params: {
        // Fetch all non-cancelled, non-expired reservations
        limit: 1000, // High limit to get all active reservations
      },
    });
    const data = response.data;
    const reservations = data.data || data;

    // Filter to only active reservations (not Cancelada or Vencida)
    return Array.isArray(reservations)
      ? reservations.filter(r =>
          r.estado !== 'Cancelada' && r.estado !== 'Vencida'
        )
      : [];
  },

  // Get reserved device IDs (public endpoint - no auth required)
  getReservedDeviceIds: async () => {
    const response = await reservasAPI.get('/api/v1/reservas/reserved-devices');
    return response.data.data || response.data || [];
  },

  // Get reservation by ID
  getReservationById: async (id) => {
    const response = await reservasAPI.get(`/api/v1/reservas/${id}`);
    return response.data;
  },

  // Get reservations for current user
  getMyReservations: async () => {
    const response = await reservasAPI.get('/api/v1/reservas/mis-reservas');
    return response.data;
  },

  // Create reservation
  createReservation: async (reservationData) => {
    const response = await reservasAPI.post('/api/v1/reservas/solicitar', reservationData);
    return response.data;
  },

  // Upload payment proof (pay deposit)
  uploadPaymentProof: async (reservationId, proofFile, paymentMethod = 'Transferencia') => {
    const formData = new FormData();
    formData.append('comprobante', proofFile);
    formData.append('metodoPago', paymentMethod);
    const response = await reservasAPI.post(
      `/api/v1/reservas/pagarsena/${reservationId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  // Confirm reservation (sales/admin)
  confirmReservation: async (id) => {
    const response = await reservasAPI.post(`/api/v1/reservas/confirmar/${id}`);
    return response.data;
  },

  // Reject reservation (sales/admin) - not in routes but keeping for future
  rejectReservation: async (id, reason) => {
    const response = await reservasAPI.post(`/api/v1/reservas/rechazar/${id}`, { motivoRechazo: reason });
    return response.data;
  },

  // Complete reservation (mark as sold - sales/admin)
  completeReservation: async (id, paymentData) => {
    const response = await reservasAPI.post(`/api/v1/reservas/completar/${id}`, paymentData);
    return response.data;
  },

  // Cancel reservation - not in routes but keeping for future
  cancelReservation: async (id, reason) => {
    const response = await reservasAPI.post(`/api/v1/reservas/cancelar/${id}`, { motivoCancelacion: reason });
    return response.data;
  },

  // Delete reservation
  deleteReservation: async (id) => {
    const response = await reservasAPI.delete(`/api/v1/reservas/${id}`);
    return response.data;
  },
};

export default reservationsAPI;
