import { get, post, put, del } from './api';

// ============================================
// SERVICIO DE REGISTROS DE ASISTENCIA
// ============================================

const BASE_URL = '/registros';

export const registrosService = {
  // ========================================
  // OBTENER TODOS LOS REGISTROS
  // ========================================
  obtenerTodos: async (filtros = {}) => {
    try {
      const response = await get(`${BASE_URL}`, filtros);
      
      return {
        data: response.data.data || [],
        total: response.data.pagination?.total || 0,
        totalPaginas: response.data.pagination?.pages || 1,
        pagina: response.data.pagination?.page || 1
      };
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER REGISTRO POR ID - GET /registros/{id} ✅ EXISTE
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
  // OBTENER REGISTROS POR EMPLEADO - GET /registros/empleado/{empleadoId} ✅ EXISTE
  // ========================================
  obtenerPorEmpleado: async (empleadoId, filtros = {}) => {
    try {
      const response = await get(`${BASE_URL}/empleado/${empleadoId}`, filtros);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER REGISTROS POR FECHA - ❌ NO EXISTE, usar pendientes
  // ========================================
  obtenerPorFecha: async (fecha, filtros = {}) => {
    try {
      return await registrosService.obtenerTodos({ ...filtros, fecha });
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER REGISTROS POR RANGO - ❌ NO EXISTE
  // ========================================
  obtenerPorRango: async (fechaInicio, fechaFin, filtros = {}) => {
    try {
      // Simular o usar pendientes
      const response = await get(`${BASE_URL}/pendientes`, {
        ...filtros,
        fechaInicio,
        fechaFin
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // CREAR REGISTRO MANUAL - POST /registros/manual ✅ EXISTE
  // ========================================
  crearManual: async (registroData) => {
    try {
      const response = await post(`${BASE_URL}/manual`, registroData);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // CREAR MÚLTIPLES REGISTROS - POST /registros/masivo ✅ EXISTE
  // ========================================
  crearMultiples: async (registros) => {
    try {
      const response = await post(`${BASE_URL}/masivo`, { registros });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // ACTUALIZAR REGISTRO MANUAL - PUT /registros/manual/{id} ✅ EXISTE
  // ========================================
  actualizar: async (id, registroData) => {
    try {
      const response = await put(`${BASE_URL}/manual/${id}`, registroData);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // ELIMINAR REGISTRO MANUAL - DELETE /registros/manual/{id} ✅ EXISTE
  // ========================================
  eliminar: async (id) => {
    try {
      const response = await del(`${BASE_URL}/manual/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER REGISTROS PENDIENTES - GET /registros/pendientes ✅ EXISTE
  // ========================================
  // ========================================
// OBTENER REGISTROS PENDIENTES - GET /registros/pendientes ✅ EXISTE
// ========================================
// ========================================
// OBTENER REGISTROS PENDIENTES - GET /registros/pendientes ✅ EXISTE
// ========================================
obtenerPendientes: async (pagina = 1, limite = 20) => {
  try {
    // Enviar los parámetros de paginación al backend
    const response = await get(`${BASE_URL}/pendientes`, { 
      pagina, 
      limite 
    });
    
    console.log('Respuesta de pendientes:', response.data); // Para debug
    
    // ✅ ESTRUCTURA CORRECTA (basada en tu backend)
    // response.data = {
    //   success: true,
    //   data: [...],              // ← Los registros están aquí
    //   pagination: {              // ← La paginación está aquí
    //     total: 41,
    //     page: 1,
    //     limit: 20,
    //     pages: 3,
    //     hasNext: true
    //   },
    //   message: "Registros pendientes"
    // }
    
    return {
      data: response.data.data || [],                    // Los registros
      total: response.data.pagination?.total || 0,       // Total de registros
      totalPaginas: response.data.pagination?.pages || 1, // Total de páginas
      pagina: response.data.pagination?.page || pagina,   // Página actual
      hasNext: response.data.pagination?.hasNext || false
    };
  } catch (error) {
    console.error('Error en obtenerPendientes:', error);
    return {
      data: [],
      total: 0,
      totalPaginas: 1,
      pagina: 1,
      hasNext: false
    };
  }
},
  // ========================================
  // MARCAR REGISTRO COMO PROCESADO - POST /registros/{id}/procesar ❌ NO EXISTE
  // ========================================
  marcarProcesado: async (id) => {
    try {
      // Este endpoint no existe en tu lista
      const response = await post(`${BASE_URL}/${id}/procesar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // EXPORTAR REGISTROS - ❌ NO EXISTE
  // ========================================
  exportar: async (formato = 'excel', filtros = {}) => {
    try {
      // Este endpoint no existe
      const response = await get(`${BASE_URL}/exportar`, {
        formato,
        ...filtros
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default registrosService;