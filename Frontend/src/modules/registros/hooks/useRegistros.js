import { useState, useCallback, useEffect } from 'react';
import { registrosService } from '../../../services';
import { empleadosService } from '../../../services';
import { useUIStore } from '../../../store';

// ============================================
// HOOK PERSONALIZADO PARA REGISTROS
// ============================================

export const useRegistros = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useUIStore();

  // Estado para empleados
  const [empleados, setEmpleados] = useState([]);
  const [empleadosMap, setEmpleadosMap] = useState({});
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);

  const [filtros, setFiltrosState] = useState({
    search: '',
    fecha: null,
    empleadoId: '',
    tipo: '',
    orden: 'fecha_desc'
  });

  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
    totalItems: 0,
    pageSizeOptions: [10, 20, 30, 50, 100]
  });

  // ========================================
  // CARGAR EMPLEADOS AL INICIO
  // ========================================
  const cargarEmpleados = useCallback(async () => {
    if (empleados.length > 0) return; // Ya están cargados

    setLoadingEmpleados(true);
    try {
      // Usar los parámetros correctos que espera el backend
      // Intenta primero sin límite
      const response = await empleadosService.obtenerTodos({
        // No enviar limite si causa error
        activo: true
      });

      // Si falla, intenta con otro enfoque
      let empleadosData = [];
      if (response && response.data) {
        empleadosData = response.data;
      } else if (Array.isArray(response)) {
        empleadosData = response;
      } else {
        empleadosData = [];
      }

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
      // No mostrar toast aquí para no saturar
    } finally {
      setLoadingEmpleados(false);
    }
  }, [empleados.length]);

  // Cargar empleados al montar el componente
  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  // ========================================
  // OBTENER REGISTROS
  // ========================================
  // ========================================
// OBTENER REGISTROS
// ========================================
const fetchRegistros = useCallback(async (params = {}) => {
  setLoading(true);
  setError(null);

  try {
    let response;

    // Determinar qué endpoint usar basado en los filtros
    if (filtros.empleadoId || params.empleadoId) {
      const empleadoId = filtros.empleadoId || params.empleadoId;
      const data = await registrosService.obtenerPorEmpleado(empleadoId);

      // Aplicar paginación local
      const registrosData = Array.isArray(data) ? data : (data.data || []);
      const pagina = params.pagina || paginacion.currentPage;
      const tamañoPagina = params.limite || paginacion.pageSize;
      const startIndex = (pagina - 1) * tamañoPagina;
      const endIndex = startIndex + tamañoPagina;
      const paginados = registrosData.slice(startIndex, endIndex);

      setRegistros(paginados);
      setPaginacion(prev => ({
        ...prev,
        totalItems: registrosData.length,
        totalPages: Math.ceil(registrosData.length / tamañoPagina),
        currentPage: pagina,
        pageSize: tamañoPagina
      }));
    }
    else if (filtros.fecha || params.fecha) {
      const fecha = filtros.fecha || params.fecha;
      const result = await registrosService.obtenerPorFecha(fecha, {
        pagina: params.pagina || paginacion.currentPage,
        limite: params.limite || paginacion.pageSize
      });

      setRegistros(result.data || []);
      setPaginacion(prev => ({
        ...prev,
        totalItems: result.total || 0,
        totalPages: result.totalPaginas || 1,
        currentPage: result.pagina || params.pagina || prev.currentPage,
        pageSize: params.limite || prev.pageSize
      }));
    }
    else {
      // Usar pendientes con paginación
      const result = await registrosService.obtenerPendientes(
        params.pagina || paginacion.currentPage,
        params.limite || paginacion.pageSize
      );

      console.log('Respuesta procesada:', result); // Para debug

      setRegistros(result.data || []);
      setPaginacion(prev => ({
        ...prev,
        totalItems: result.total || 0,
        totalPages: result.totalPaginas || 1,
        currentPage: result.pagina || params.pagina || prev.currentPage,
        pageSize: params.limite || prev.pageSize
      }));
    }

    // Enriquecer registros con nombres de empleados
    if (registros.length > 0 && Object.keys(empleadosMap).length > 0) {
      setRegistros(prev =>
        prev.map(registro => ({
          ...registro,
          empleadoNombre: empleadosMap[registro.empleadoId]?.nombre || `Empleado #${registro.empleadoId}`,
          codigoEmpleado: empleadosMap[registro.empleadoId]?.codigo || `EMP${String(registro.empleadoId).padStart(3, '0')}`
        }))
      );
    }

  } catch (err) {
    console.error('Error en fetchRegistros:', err);
    setError(err.message || 'Error al cargar registros');
    setRegistros([]);

    showToast({
      type: 'error',
      message: 'Error al cargar registros'
    });
  } finally {
    setLoading(false);
  }
}, [filtros, paginacion.currentPage, paginacion.pageSize, empleadosMap, showToast]);

  // ========================================
  // ELIMINAR REGISTRO
  // ========================================
  const eliminarRegistro = useCallback(async (id) => {
    setLoading(true);
    try {
      await registrosService.eliminar(id);
      setRegistros(prev => prev.filter(r => r.id !== id));
      showToast({
        type: 'success',
        message: 'Registro eliminado correctamente'
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al eliminar registro'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // ACTUALIZAR FILTROS
  // ========================================
  const setFiltros = useCallback((nuevosFiltros) => {
    setFiltrosState(prev => ({
      ...prev,
      ...nuevosFiltros
    }));
  }, []);

  // ========================================
  // CAMBIAR PÁGINA
  // ========================================
  const cambiarPagina = useCallback((nuevaPagina) => {
    setPaginacion(prev => ({
      ...prev,
      currentPage: nuevaPagina
    }));
    fetchRegistros({ pagina: nuevaPagina });
  }, [fetchRegistros]);

  // ========================================
  // CAMBIAR TAMAÑO DE PÁGINA
  // ========================================
  const cambiarPageSize = useCallback((nuevoSize) => {
    setPaginacion(prev => ({
      ...prev,
      pageSize: nuevoSize,
      currentPage: 1
    }));
    fetchRegistros({ limite: nuevoSize, pagina: 1 });
  }, [fetchRegistros]);

  // Efecto para enriquecer registros cuando cambian los empleados
  useEffect(() => {
    if (registros.length > 0 && Object.keys(empleadosMap).length > 0) {
      setRegistros(prev =>
        prev.map(registro => ({
          ...registro,
          empleadoNombre: empleadosMap[registro.empleadoId]?.nombre || `Empleado #${registro.empleadoId}`,
          codigoEmpleado: empleadosMap[registro.empleadoId]?.codigo || `EMP${String(registro.empleadoId).padStart(3, '0')}`
        }))
      );
    }
  }, [empleadosMap]);

  return {
    // Estado
    registros,
    loading: loading || loadingEmpleados,
    error,
    filtros,
    paginacion: {
      ...paginacion,
      onPageSizeChange: cambiarPageSize
    },

    // Acciones principales
    fetchRegistros,
    eliminarRegistro,

    // Acciones de UI
    setFiltros,
    cambiarPagina
  };
};

export default useRegistros;