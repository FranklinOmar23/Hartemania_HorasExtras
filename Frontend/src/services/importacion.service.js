import { get, post, uploadFile, downloadFile } from './api';

// ============================================
// SERVICIO DE IMPORTACIÓN DE EXCEL
// ============================================

const BASE_URL = '/importacion';

export const importacionService = {
  // ========================================
  // IMPORTAR ARCHIVO EXCEL
  // ========================================
  // ========================================
  importar: async (archivo, mapeo = {}, onProgress = null) => {
    try {
      console.log('📤 importacion.service.importar - archivo:', archivo?.name);
      
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('mapeo', JSON.stringify(mapeo));

      const response = await uploadFile(BASE_URL, formData, onProgress);
      return response.data;
    } catch (error) {
      console.error('❌ Error en importar:', error);
      throw error;
    }
  },

  // ========================================
  // VALIDAR ARCHIVO EXCEL
  // ========================================
  validar: async (archivo) => {
    try {
      console.log('📤 importacion.service.validar - archivo:', archivo?.name);
      
      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await post(`${BASE_URL}/validar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error en validar:', error);
      throw error;
    }
  },

  // ========================================
  // OBTENER TODAS LAS IMPORTACIONES
  // ========================================
  obtenerTodas: async (filtros = {}) => {
    try {
      const response = await get(BASE_URL, filtros);
      return {
        data: response.data.data || response.data,
        total: response.data.total || response.data.length
      };
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER IMPORTACIÓN POR ID
  // ========================================
  obtenerPorId: async (id) => {
    try {
      const response = await get(`${BASE_URL}/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // PROCESAR IMPORTACIÓN
  // ========================================
  procesar: async (id) => {
    try {
      const response = await post(`${BASE_URL}/${id}/procesar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER REGISTROS DE UNA IMPORTACIÓN
  // ========================================
  obtenerRegistros: async (id, filtros = {}) => {
    try {
      const response = await get(`${BASE_URL}/${id}/registros`, filtros);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER ERRORES DE UNA IMPORTACIÓN
  // ========================================
  obtenerErrores: async (id) => {
    try {
      const response = await get(`${BASE_URL}/${id}/errores`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // DESCARGAR PLANTILLA EXCEL
  // ========================================
  descargarPlantilla: async () => {
    try {
      const response = await downloadFile(`${BASE_URL}/plantilla`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // DESCARGAR REPORTE DE ERRORES
  // ========================================
  descargarReporteErrores: async (id) => {
    try {
      const response = await downloadFile(`${BASE_URL}/${id}/errores/exportar`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // CANCELAR IMPORTACIÓN
  // ========================================
  cancelar: async (id) => {
    try {
      const response = await post(`${BASE_URL}/${id}/cancelar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // ELIMINAR IMPORTACIÓN
  // ========================================
  eliminar: async (id) => {
    try {
      const response = await del(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER ESTADÍSTICAS DE IMPORTACIONES
  // ========================================
  obtenerEstadisticas: async () => {
    try {
      const response = await get(`${BASE_URL}/estadisticas`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default importacionService;