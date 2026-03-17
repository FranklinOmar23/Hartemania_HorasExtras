import { useState, useCallback } from 'react';
import { empleadosService } from '../../../services';
import { useUIStore } from '../../../store';

// ============================================
// HOOK PERSONALIZADO PARA EMPLEADOS
// ============================================

export const useEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useUIStore();

  // Estado de filtros y paginación
  const [filtros, setFiltrosState] = useState({
    search: '',
    departamento: '',
    activo: true,
    orden: ''
  });

  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
    totalItems: 0,
    pageSizeOptions: [10, 20, 30, 50, 100]
  });

  // ========================================
  // OBTENER EMPLEADOS
  // ========================================
  const fetchEmpleados = useCallback(async (params = {}) => {
  setLoading(true);
  setError(null);

  try {
    const response = await empleadosService.obtenerTodos({
      ...filtros,
      ...params
    });

    console.log('Respuesta procesada:', response); // Para debug

    setEmpleados(response.data || []);
    setPaginacion(prev => ({
      ...prev,
      totalItems: response.total || 0,
      totalPages: response.totalPaginas || 1,
      currentPage: params.pagina || response.pagina || prev.currentPage,
      pageSize: params.limite || prev.pageSize
    }));
  } catch (err) {
    setError(err.message);
    showToast({
      type: 'error',
      message: 'Error al cargar empleados'
    });
  } finally {
    setLoading(false);
  }
}, [filtros, showToast]);

  // ========================================
  // ACTUALIZAR FILTROS
  // ========================================
  const setFiltros = useCallback((nuevosFiltros) => {
    setFiltrosState(prev => ({
      ...prev,
      ...nuevosFiltros
    }));
    // Opcional: Recargar automáticamente al cambiar filtros
    // fetchEmpleados({ pagina: 1, ...nuevosFiltros });
  }, []);

  // ========================================
  // CAMBIAR PÁGINA - CORREGIDO ✅
  // ========================================
  const cambiarPagina = useCallback((nuevaPagina) => {
    setPaginacion(prev => ({
      ...prev,
      currentPage: nuevaPagina
    }));
    // 👉 Recargar datos con la nueva página
    fetchEmpleados({ 
      pagina: nuevaPagina, 
      limite: paginacion.pageSize 
    });
  }, [fetchEmpleados, paginacion.pageSize]);

  // ========================================
  // CAMBIAR TAMAÑO DE PÁGINA - CORREGIDO ✅
  // ========================================
  const cambiarPageSize = useCallback((nuevoSize) => {
    setPaginacion(prev => ({
      ...prev,
      pageSize: nuevoSize,
      currentPage: 1
    }));
    // 👉 Recargar datos con nuevo tamaño
    fetchEmpleados({ 
      pagina: 1, 
      limite: nuevoSize 
    });
  }, [fetchEmpleados]);

  // ========================================
  // OTRAS FUNCIONES (sin cambios)
  // ========================================
  const obtenerEmpleadoPorId = useCallback(async (id) => {
    try {
      const empleado = await empleadosService.obtenerPorId(id);
      return empleado;
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Error al cargar empleado'
      });
      throw err;
    }
  }, [showToast]);

  const crearEmpleado = useCallback(async (data) => {
    setLoading(true);
    try {
      const nuevo = await empleadosService.crear(data);
      showToast({
        type: 'success',
        message: 'Empleado creado correctamente'
      });
      return nuevo;
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al crear empleado'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const actualizarEmpleado = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const actualizado = await empleadosService.actualizar(id, data);
      showToast({
        type: 'success',
        message: 'Empleado actualizado correctamente'
      });
      return actualizado;
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al actualizar empleado'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const eliminarEmpleado = useCallback(async (id) => {
    setLoading(true);
    try {
      await empleadosService.eliminar(id);
      setEmpleados(prev => prev.filter(emp => emp.id !== id));
      showToast({
        type: 'success',
        message: 'Empleado eliminado correctamente'
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al eliminar empleado'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
// CARGAR EMPLEADOS AL INICIO
// ========================================
const cargarEmpleados = useCallback(async () => {
  if (empleados.length > 0) return; // Ya están cargados
  
  setLoadingEmpleados(true);
  try {
    // Usar el nuevo endpoint que devuelve TODOS los empleados
    const empleadosData = await empleadosService.obtenerTodosActivos();
    
    console.log(`✅ Cargados ${empleadosData.length} empleados para caché`);
    
    // Crear un mapa para acceso rápido por ID
    const map = {};
    empleadosData.forEach(emp => {
      map[emp.id] = {
        nombre: `${emp.nombre || ''} ${emp.apellido || ''}`.trim(),
        codigo: emp.codigo || `EMP${String(emp.id).padStart(3, '0')}`
      };
    });
    
    setEmpleados(empleadosData);
    setEmpleadosMap(map);
    
  } catch (error) {
    console.error('Error al cargar empleados:', error);
  } finally {
    setLoadingEmpleados(false);
  }
}, [empleados.length]);

  const eliminarMultiples = useCallback(async (ids) => {
    setLoading(true);
    try {
      await empleadosService.eliminarMultiples(ids);
      setEmpleados(prev => prev.filter(emp => !ids.includes(emp.id)));
      showToast({
        type: 'success',
        message: `${ids.length} empleados eliminados correctamente`
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al eliminar empleados'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const buscarEmpleados = useCallback(async (termino) => {
    setLoading(true);
    try {
      const resultados = await empleadosService.buscar(termino);
      return resultados;
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Error al buscar empleados'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const obtenerEstadisticas = useCallback(async (id) => {
    try {
      const stats = await empleadosService.obtenerEstadisticas(id);
      return stats;
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Error al cargar estadísticas'
      });
      throw err;
    }
  }, [showToast]);

  return {
    // Estado
    empleados,
    loading,
    error,
    filtros,
    paginacion: {
      ...paginacion,
      onPageSizeChange: cambiarPageSize
    },

    // Acciones principales
    fetchEmpleados,
    obtenerEmpleadoPorId,
    crearEmpleado,
    actualizarEmpleado,
    eliminarEmpleado,
    eliminarMultiples,
    buscarEmpleados,
    obtenerEstadisticas,
    cargarEmpleados,
    // Acciones de UI
    setFiltros,
    cambiarPagina
  };
};

export default useEmpleados;