import { get, post } from './api';

// ============================================
// SERVICIO DE CÁLCULOS DE HORAS EXTRAS
// ============================================

const BASE_URL = '/quincenas';

export const calculosService = {
  // ========================================
  // CALCULAR HORAS EXTRAS PARA UNA QUINCENA
  // POST /quincenas/calcular/{anio}/{mes}/{quincena}
  // ========================================
  calcularQuincena: async (anio, mes, quincena) => {
    try {
      const response = await post(`${BASE_URL}/calcular/${anio}/${mes}/${quincena}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error en calcularQuincena:', error);
      throw error;
    }
  },

  // ========================================
  // RECALCULAR QUINCENA (borra y recalcula)
  // POST /quincenas/recalcular/{anio}/{mes}/{quincena}
  // ========================================
  recalcularQuincena: async (anio, mes, quincena) => {
    try {
      const response = await post(`${BASE_URL}/recalcular/${anio}/${mes}/${quincena}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER RESULTADOS DE UNA QUINCENA
  // GET /quincenas/{anio}/{mes}/{quincena}
  // ========================================
  obtenerResultadosQuincena: async (anio, mes, quincena) => {
    try {
      const response = await get(`${BASE_URL}/${anio}/${mes}/${quincena}`);
      console.log('🔍 Respuesta del backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en obtenerResultadosQuincena:', error);
      throw error;
    }
  },

  // ========================================
  // OBTENER RESUMEN MENSUAL (AMBAS QUINCENAS)
  // GET /quincenas/mensual/{anio}/{mes}
  // ========================================
  obtenerResumenMensual: async (anio, mes) => {
    try {
      const response = await get(`${BASE_URL}/mensual/${anio}/${mes}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER HISTORIAL DE QUINCENAS DE UN EMPLEADO
  // GET /quincenas/empleado/{empleadoId}
  // ========================================
  obtenerHistorialEmpleado: async (empleadoId) => {
    try {
      const response = await get(`${BASE_URL}/empleado/${empleadoId}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER RANKING DE EMPLEADOS
  // GET /quincenas/ranking/{anio}/{mes}/{quincena}
  // ========================================
  obtenerRanking: async (anio, mes, quincena, limite = 10) => {
    try {
      const response = await get(`${BASE_URL}/ranking/${anio}/${mes}/${quincena}`, { limite });
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // COMPARAR DOS QUINCENAS
  // GET /quincenas/comparar
  // ========================================
  compararQuincenas: async (quincena1, quincena2) => {
    try {
      const response = await get(`${BASE_URL}/comparar`, {
        quincena1: `${quincena1.anio}-${quincena1.mes}-${quincena1.quincena}`,
        quincena2: `${quincena2.anio}-${quincena2.mes}-${quincena2.quincena}`
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // EXPORTAR QUINCENA
  // GET /quincenas/exportar/{anio}/{mes}/{quincena}
  // ========================================
  exportarQuincena: async (anio, mes, quincena, formato = 'excel') => {
    try {
      const response = await get(`${BASE_URL}/exportar/${anio}/${mes}/${quincena}`, {
        formato
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // CALCULAR TODOS LOS REGISTROS PENDIENTES
  // POST /quincenas/pendientes (si existe)
  // ========================================
  calcularPendientes: async (anio, mes, quincena) => {
    try {
      const response = await post(`${BASE_URL}/pendientes`, { anio, mes, quincena });
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },
  // ========================================
// OBTENER DETALLE DE CÁLCULO POR ID
// ========================================
obtenerDetalle: async (id) => {
  try {
    // Ajusta esta URL según tu backend
    // Opción 1: Si tienes /quincenas/{id}
    const response = await get(`${BASE_URL}/${id}`);
    
    // Opción 2: Si tienes /quincenas/detalle/{id}
    // const response = await get(`${BASE_URL}/detalle/${id}`);
    
    // Opción 3: Si tienes /calculos/{id} (otro base URL)
    // const response = await get(`/calculos/${id}`);
    
    console.log('Detalle recibido:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error en obtenerDetalle:', error);
    throw error;
  }
}
  
};

export default calculosService;