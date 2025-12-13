import { baseAPI } from './client';

const HORARIOS_PATH = '/api/v1/horarios';

/**
 * API client for managing seller availability schedules (horarios)
 */
export const schedulesAPI = {
  // Get schedules by seller username
  getSchedulesBySeller: async (vendedor) => {
    const response = await baseAPI.get(`${HORARIOS_PATH}/vendedor/${vendedor}`);
    return response.data;
  },

  // Get schedules by branch
  getSchedulesByBranch: async (sucursal) => {
    const response = await baseAPI.get(`${HORARIOS_PATH}/sucursal/${sucursal}`);
    return response.data;
  },

  // Create a single schedule entry
  // scheduleData: { vendedor, sucursal, diaSemana, horaInicio, horaFinal }
  createSchedule: async (scheduleData) => {
    const response = await baseAPI.post(`${HORARIOS_PATH}/nuevo-horario`, scheduleData);
    return response.data;
  },

  // Create multiple schedule entries (same time, multiple days)
  // schedulesData: { vendedor, sucursal, diasSemana: [], horaInicio, horaFinal }
  createMultipleSchedules: async (schedulesData) => {
    const response = await baseAPI.post(`${HORARIOS_PATH}/nuevos-horarios`, schedulesData);
    return response.data;
  },

  // Delete a schedule entry
  deleteSchedule: async (scheduleId) => {
    const response = await baseAPI.delete(`${HORARIOS_PATH}/${scheduleId}`);
    return response.data;
  },
};

export default schedulesAPI;
