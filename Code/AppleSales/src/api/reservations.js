import { reservasAPI } from './client';
import { API_PATHS } from '../constants';

export const reservationsAPI = {
  // Get all reservations
  getAllReservations: async (params) => {
    const response = await reservasAPI.get(API_PATHS.RESERVATIONS, { params });
    return response.data;
  },

  // Get reservation by ID
  getReservationById: async (id) => {
    const response = await reservasAPI.get(`${API_PATHS.RESERVATIONS}/${id}`);
    return response.data;
  },

  // Get reservations for current user
  getMyReservations: async () => {
    const response = await reservasAPI.get(`${API_PATHS.RESERVATIONS}/my`);
    return response.data;
  },

  // Create reservation
  createReservation: async (reservationData) => {
    const response = await reservasAPI.post(API_PATHS.RESERVATIONS, reservationData);
    return response.data;
  },

  // Upload payment proof
  uploadPaymentProof: async (reservationId, proofFile) => {
    const formData = new FormData();
    formData.append('paymentProof', proofFile);
    const response = await reservasAPI.post(
      `${API_PATHS.RESERVATIONS}/${reservationId}/payment-proof`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  // Confirm reservation (sales/admin)
  confirmReservation: async (id) => {
    const response = await reservasAPI.post(`${API_PATHS.RESERVATIONS}/${id}/confirm`);
    return response.data;
  },

  // Reject reservation (sales/admin)
  rejectReservation: async (id, reason) => {
    const response = await reservasAPI.post(`${API_PATHS.RESERVATIONS}/${id}/reject`, { reason });
    return response.data;
  },

  // Complete reservation (mark as sold - sales/admin)
  completeReservation: async (id) => {
    const response = await reservasAPI.post(`${API_PATHS.RESERVATIONS}/${id}/complete`);
    return response.data;
  },

  // Cancel reservation
  cancelReservation: async (id, reason) => {
    const response = await reservasAPI.post(`${API_PATHS.RESERVATIONS}/${id}/cancel`, { reason });
    return response.data;
  },

  // Delete reservation
  deleteReservation: async (id) => {
    const response = await reservasAPI.delete(`${API_PATHS.RESERVATIONS}/${id}`);
    return response.data;
  },
};

export default reservationsAPI;
