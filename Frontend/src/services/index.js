// ============================================
// ARCHIVO DE EXPORTACIÓN DE SERVICES
// ============================================

// 1. IMPORTAMOS TODO PRIMERO (Sintaxis ES6 para Frontend)
import api from './api';
import empleadosService from './empleados.service';
import registrosService from './registros.service';
import importacionService from './importacion.service';
import calculosService from './calculos.service';
import reportesService from './reportes.service';
import configuracionService from './configuracion.service';

// 2. EXPORTACIONES NOMBRADAS (Mantiene compatibilidad con tus imports actuales)
export { 
  api, 
  empleadosService, 
  registrosService, 
  importacionService, 
  calculosService, 
  reportesService, 
  configuracionService 
};

// ============================================
// 3. EXPORTACIÓN POR DEFECTO
// ============================================
export default {
  api,
  empleados: empleadosService,
  registros: registrosService,
  importacion: importacionService,
  calculos: calculosService,
  reportes: reportesService,
  configuracion: configuracionService
};

// ============================================
// 4. MÉTODOS DE UTILIDAD PARA API
// ============================================
export const apiMethods = {
  get: (url, params) => api.get(url, params),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  patch: (url, data) => api.patch(url, data),
  delete: (url) => api.del(url),
  uploadFile: (url, file, onProgress) => api.uploadFile(url, file, onProgress),
  downloadFile: (url, params, fileName) => api.downloadFile(url, params, fileName)
};

// ============================================
// 5. HOOKS PERSONALIZADOS PARA SERVICIOS
// ============================================

export const useEmpleadosService = () => empleadosService;
export const useRegistrosService = () => registrosService;
export const useImportacionService = () => importacionService;
export const useCalculosService = () => calculosService;
export const useReportesService = () => reportesService;
export const useConfiguracionService = () => configuracionService;