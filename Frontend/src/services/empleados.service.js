import { get, post, put, del } from './api';

// ============================================
// SERVICIO DE EMPLEADOS
// CRUD completo para empleados
// ============================================

const BASE_URL = '/empleados';

export const empleadosService = {
  // ========================================
  // OBTENER TODOS LOS EMPLEADOS
  // ========================================
  obtenerTodos: async (filtros = {}) => {
    try {
      const response = await get(BASE_URL, filtros);
      return {
        data: response.data.data || response.data,
        total: response.data.total || response.data.length,
        totalPaginas: response.data.totalPaginas || 1,
        pagina: response.data.pagina || 1
      };
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER TODOS LOS EMPLEADOS (SIN PAGINACIÓN)
  // ========================================
 // ========================================
// OBTENER TODOS LOS EMPLEADOS
// ========================================
obtenerTodos: async (filtros = {}) => {
  try {
    const response = await get(BASE_URL, filtros);
    
    console.log('Respuesta completa:', response.data); // Para debug
    
    // ✅ LA ESTRUCTURA CORRECTA SEGÚN TU LOG:
    // response.data = {
    //   success: true,
    //   data: [...],           ← Los empleados están aquí
    //   pagination: {           ← La paginación está aquí
    //     total: 34,
    //     page: 1,
    //     limit: 20,
    //     pages: 2,
    //     hasNext: true
    //   },
    //   message: "..."
    // }
    
    return {
      data: response.data.data || [],                    // Los empleados
      total: response.data.pagination?.total || 0,       // Total de registros
      totalPaginas: response.data.pagination?.pages || 1, // Total de páginas
      pagina: response.data.pagination?.page || 1,        // Página actual
      hasNext: response.data.pagination?.hasNext || false
    };
  } catch (error) {
    console.error('Error en obtenerTodos:', error);
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
  // OBTENER EMPLEADO POR ID
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
  // OBTENER EMPLEADO POR CÓDIGO
  // ========================================
  obtenerPorCodigo: async (codigo) => {
    try {
      const response = await get(`${BASE_URL}/codigo/${codigo}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // CREAR NUEVO EMPLEADO
  // ========================================
  crear: async (empleadoData) => {
    try {
      const response = await post(BASE_URL, empleadoData);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // ACTUALIZAR EMPLEADO
  // ========================================
  actualizar: async (id, empleadoData) => {
    try {
      const response = await put(`${BASE_URL}/${id}`, empleadoData);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // ELIMINAR EMPLEADO (SOFT DELETE)
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
  // ELIMINAR MÚLTIPLES EMPLEADOS
  // ========================================
  eliminarMultiples: async (ids) => {
    try {
      const response = await post(`${BASE_URL}/eliminar-multiples`, { ids });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // BUSCAR EMPLEADOS
  // ========================================
  buscar: async (termino, filtros = {}) => {
    try {
      const response = await get(`${BASE_URL}/buscar`, {
        q: termino,
        ...filtros
      });
      return {
        data: response.data.data || response.data,
        total: response.data.total || response.data.length
      };
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER EMPLEADOS ACTIVOS
  // ========================================
  obtenerActivos: async () => {
    try {
      const response = await get(`${BASE_URL}/activos`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER EMPLEADOS INACTIVOS
  // ========================================
  obtenerInactivos: async () => {
    try {
      const response = await get(`${BASE_URL}/inactivos`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // OBTENER DEPARTAMENTOS ÚNICOS
  // ========================================
  obtenerDepartamentos: async () => {
    try {
      const response = await get(`${BASE_URL}/departamentos`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // ACTIVAR EMPLEADO
  // ========================================
  activar: async (id) => {
    try {
      const response = await post(`${BASE_URL}/${id}/activar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // DESACTIVAR EMPLEADO
  // ========================================
  desactivar: async (id) => {
    try {
      const response = await post(`${BASE_URL}/${id}/desactivar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // EXPORTAR EMPLEADOS
  // ========================================
  exportar: async (formato = 'excel', filtros = {}) => {
    try {
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

export default empleadosService;