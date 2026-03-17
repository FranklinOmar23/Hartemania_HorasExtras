import { get, post, put, del } from './api';

// ============================================
// SERVICIO DE CONFIGURACIÓN
// ============================================

const BASE_URL = '/configuracion';

export const configuracionService = {
  // ========================================
  // JORNADAS LABORALES
  // ========================================
  jornadas: {
    obtenerTodas: async () => {
      try {
        const response = await get(`${BASE_URL}/jornadas`);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    obtenerPorId: async (id) => {
      try {
        const response = await get(`${BASE_URL}/jornadas/${id}`);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    crear: async (jornadaData) => {
      try {
        const response = await post(`${BASE_URL}/jornadas`, jornadaData);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    actualizar: async (id, jornadaData) => {
      try {
        const response = await put(`${BASE_URL}/jornadas/${id}`, jornadaData);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    eliminar: async (id) => {
      try {
        const response = await del(`${BASE_URL}/jornadas/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    obtenerPorDia: async (diaSemana) => {
      try {
        const response = await get(`${BASE_URL}/jornadas/dia/${diaSemana}`);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // ========================================
  // FERIADOS
  // ========================================
  feriados: {
    obtenerTodos: async (anio = null) => {
      try {
        const response = await get(`${BASE_URL}/feriados`, { anio });
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    obtenerPorId: async (id) => {
      try {
        const response = await get(`${BASE_URL}/feriados/${id}`);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    crear: async (feriadoData) => {
      try {
        const response = await post(`${BASE_URL}/feriados`, feriadoData);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    actualizar: async (id, feriadoData) => {
      try {
        const response = await put(`${BASE_URL}/feriados/${id}`, feriadoData);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    eliminar: async (id) => {
      try {
        const response = await del(`${BASE_URL}/feriados/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    esFeriado: async (fecha) => {
      try {
        const response = await get(`${BASE_URL}/feriados/verificar`, { fecha });
        return response.data.esFeriado;
      } catch (error) {
        throw error;
      }
    }
  },

  // ========================================
  // TIPOS DE HORAS EXTRAS
  // ========================================
  tiposHE: {
    obtenerTodos: async () => {
      try {
        const response = await get(`${BASE_URL}/tipos-he`);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    obtenerPorId: async (id) => {
      try {
        const response = await get(`${BASE_URL}/tipos-he/${id}`);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    crear: async (tipoData) => {
      try {
        const response = await post(`${BASE_URL}/tipos-he`, tipoData);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    actualizar: async (id, tipoData) => {
      try {
        const response = await put(`${BASE_URL}/tipos-he/${id}`, tipoData);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    eliminar: async (id) => {
      try {
        const response = await del(`${BASE_URL}/tipos-he/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    obtenerPorCodigo: async (codigo) => {
      try {
        const response = await get(`${BASE_URL}/tipos-he/codigo/${codigo}`);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // ========================================
  // CONFIGURACIÓN GENERAL
  // ========================================
  general: {
    obtener: async () => {
      try {
        const response = await get(`${BASE_URL}/general`);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    actualizar: async (configData) => {
      try {
        const response = await put(`${BASE_URL}/general`, configData);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    resetear: async () => {
      try {
        const response = await post(`${BASE_URL}/general/resetear`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // ========================================
  // RESPALDO Y RESTAURACIÓN
  // ========================================
  respaldo: {
    crear: async () => {
      try {
        const response = await post(`${BASE_URL}/respaldo/crear`, {}, {
          responseType: 'blob'
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    restaurar: async (archivo) => {
      try {
        const formData = new FormData();
        formData.append('archivo', archivo);

        const response = await post(`${BASE_URL}/respaldo/restaurar`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    listar: async () => {
      try {
        const response = await get(`${BASE_URL}/respaldo/listar`);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    }
  }
};

export default configuracionService;