import { agendaAPI } from './client';

/**
 * API client for managing seller availability schedules (horarios)
 */
export const schedulesAPI = {
  // Get schedules by seller username
  getSchedulesBySeller: async (vendedor) => {
    const response = await agendaAPI.get(`/api/v1/horarios/vendedor/${vendedor}`);
    return response.data;
  },

  // Get schedules by branch
  getSchedulesByBranch: async (sucursal) => {
    const response = await agendaAPI.get(`/api/v1/horarios/sucursal/${sucursal}`);
    return response.data;
  },

  // Create a single schedule entry
  // scheduleData: { vendedor, sucursal, diaSemana, horaInicio, horaFinal }
  createSchedule: async (scheduleData) => {
    const response = await agendaAPI.post('/api/v1/horarios/nuevo-horario', scheduleData);
    return response.data;
  },

  // Create multiple schedule entries (same time, multiple days)
  // schedulesData: { vendedor, sucursal, diasSemana: [], horaInicio, horaFinal }
  createMultipleSchedules: async (schedulesData) => {
    const response = await agendaAPI.post('/api/v1/horarios/nuevos-horarios', schedulesData);
    return response.data;
  },

  // Delete a schedule entry
  deleteSchedule: async (scheduleId) => {
    const response = await agendaAPI.delete(`/api/v1/horarios/${scheduleId}`);
    return response.data;
  },
};

export default schedulesAPI;
