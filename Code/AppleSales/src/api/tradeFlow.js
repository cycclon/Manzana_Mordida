import { baseAPI } from './client';

const DEVICES_PATH = '/api/equipos';

/**
 * Trade-in profit flow API (msProductos).
 * Lee las cadenas de canje (equipo de proveedor -> equipos recibidos en canje al
 * venderlo -> ...) y su resumen de ganancia. El vínculo padre->hijo es el campo
 * `equipoCanjeOrigen` de cada Equipo. Ver getFlujo/getFlujos en EquipoController.
 */
export const tradeFlowAPI = {
  // Listado de cadenas (raíces) con su resumen: invertido, ganancia, ROI, estado.
  getFlujos: async (params) => {
    const response = await baseAPI.get(`${DEVICES_PATH}/flujos`, { params });
    return response.data;
  },

  // Flujo completo (nodos + aristas + resumen) de la cadena que contiene un equipo.
  getFlujo: async (equipoId) => {
    const response = await baseAPI.get(`${DEVICES_PATH}/flujo/${equipoId}`);
    return response.data;
  },
};

export default tradeFlowAPI;
