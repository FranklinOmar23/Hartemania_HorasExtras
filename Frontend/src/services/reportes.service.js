import { get, post, downloadFile } from './api';

// ============================================
// SERVICIO DE REPORTES - USANDO RUTAS DEL BACKEND
// ============================================

const BASE_URL = '/reportes';  // Coincide con tu backend

export const reportesService = {
  // ========================================
  // REPORTE QUINCENAL - GET /reportes/quincenal/{anio}/{mes}/{quincena}
  // ========================================
  quincenal: async (anio, mes, quincena, formato = 'excel') => {
    try {
      // Usando la ruta exacta del backend: /reportes/quincenal/2026/2/1
      const url = `${BASE_URL}/quincenal/${anio}/${mes}/${quincena}`;
      const response = await get(url, { formato }, {
        responseType: formato === 'excel' ? 'blob' : 'json'
      });

      if (formato === 'excel') {
        return downloadFile(url, { formato }, `HE_${anio}_${mes}_Q${quincena}.xlsx`);
      }

      return response.data.data || response.data;
    } catch (error) {
      console.error('Error en reporte quincenal:', error);
      throw error;
    }
  },

  // ========================================
  // REPORTE MENSUAL - GET /reportes/mensual/{anio}/{mes}
  // ========================================
  mensual: async (anio, mes, formato = 'excel') => {
    try {
      const url = `${BASE_URL}/mensual/${anio}/${mes}`;
      const response = await get(url, { formato }, {
        responseType: formato === 'excel' ? 'blob' : 'json'
      });

      if (formato === 'excel') {
        return downloadFile(url, { formato }, `HE_${anio}_${mes}.xlsx`);
      }

      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // REPORTE ANUAL - GET /reportes/anual/{anio}
  // ========================================
  anual: async (anio, formato = 'excel') => {
    try {
      const url = `${BASE_URL}/anual/${anio}`;
      const response = await get(url, { formato }, {
        responseType: formato === 'excel' ? 'blob' : 'json'
      });

      if (formato === 'excel') {
        return downloadFile(url, { formato }, `HE_ANUAL_${anio}.xlsx`);
      }

      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // REPORTE POR EMPLEADO - GET /reportes/empleado/{empleadoId}
  // ========================================
  empleado: async (empleadoId, anio, mes, formato = 'excel') => {
    try {
      const url = `${BASE_URL}/empleado/${empleadoId}`;
      const response = await get(url, { anio, mes, formato }, {
        responseType: formato === 'excel' ? 'blob' : 'json'
      });

      if (formato === 'excel') {
        return downloadFile(url, { anio, mes, formato }, `HE_EMP_${empleadoId}_${anio}_${mes}.xlsx`);
      }

      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // REPORTE IMPORTACIONES - GET /reportes/importaciones
  // ========================================
  importaciones: async (filtros = {}) => {
    try {
      const response = await get(`${BASE_URL}/importaciones`, filtros);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // REPORTE COMPARATIVO - GET /reportes/comparativo
  // ========================================
  comparativo: async (anioInicio, mesInicio, anioFin, mesFin, formato = 'excel') => {
    try {
      const response = await get(`${BASE_URL}/comparativo`, {
        anioInicio,
        mesInicio,
        anioFin,
        mesFin,
        formato
      }, {
        responseType: formato === 'excel' ? 'blob' : 'json'
      });

      if (formato === 'excel') {
        return downloadFile(`${BASE_URL}/comparativo`, 
          { anioInicio, mesInicio, anioFin, mesFin, formato }, 
          `HE_COMPARATIVO_${anioInicio}_${mesInicio}_${anioFin}_${mesFin}.xlsx`);
      }

      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // DESCARGAR ARCHIVO - GET /reportes/download/{filename}
  // ========================================
  descargar: async (filename) => {
    try {
      return await downloadFile(`${BASE_URL}/download/${filename}`);
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // PROGRAMAR ENVÍO - POST /reportes/programar
  // ========================================
  programar: async (config) => {
    try {
      const response = await post(`${BASE_URL}/programar`, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // DASHBOARD - ¿Esta ruta existe en el backend?
  // Si no existe, comentarla o implementarla en el backend
  // ========================================
  // dashboard: async (anio, mes) => {
  //   try {
  //     const response = await get(`${BASE_URL}/dashboard`, { anio, mes });
  //     return response.data.data || response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
};

export default reportesService;