import { useState, useCallback } from 'react';
import { empleadosService } from '../../../services';
import { useUIStore } from '../../../store';

export const useEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useUIStore();

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

  const fetchEmpleados = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await empleadosService.obtenerTodos({
        ...filtros,
        ...params
      });

      setEmpleados(response.data || []);
      setPaginacion((prev) => ({
        ...prev,
        totalItems: response.total || 0,
        totalPages: response.totalPaginas || 1,
        currentPage: params.pagina || response.pagina || prev.currentPage,
        pageSize: params.limite || prev.pageSize
      }));

      return response;
    } catch (err) {
      setError(err.message);
      showToast({
        type: 'error',
        message: 'Error al cargar empleados'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filtros, showToast]);

  const setFiltros = useCallback((nuevosFiltros) => {
    setFiltrosState((prev) => ({
      ...prev,
      ...nuevosFiltros
    }));
    setPaginacion((prev) => ({
      ...prev,
      currentPage: 1
    }));
  }, []);

  const cambiarPagina = useCallback((nuevaPagina) => {
    setPaginacion((prev) => ({
      ...prev,
      currentPage: nuevaPagina
    }));
  }, []);

  const cambiarPageSize = useCallback((nuevoSize) => {
    setPaginacion((prev) => ({
      ...prev,
      pageSize: nuevoSize,
      currentPage: 1
    }));
  }, []);

  const obtenerEmpleadoPorId = useCallback(async (id) => {
    try {
      return await empleadosService.obtenerPorId(id);
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
      setEmpleados((prev) => prev.filter((empleado) => empleado.id !== id));
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

  const eliminarMultiples = useCallback(async (ids) => {
    setLoading(true);
    try {
      await Promise.all(ids.map((id) => empleadosService.eliminar(id)));
      setEmpleados((prev) => prev.filter((empleado) => !ids.includes(empleado.id)));
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
      return await empleadosService.buscar(termino);
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
      return await empleadosService.obtenerEstadisticas(id);
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Error al cargar estadísticas'
      });
      throw err;
    }
  }, [showToast]);

  const cargarEmpleados = useCallback(async () => {
    const empleadosData = await empleadosService.obtenerTodosActivos();
    setEmpleados(empleadosData || []);
    return empleadosData;
  }, []);

  return {
    empleados,
    loading,
    error,
    filtros,
    paginacion: {
      ...paginacion,
      onPageSizeChange: cambiarPageSize
    },
    fetchEmpleados,
    obtenerEmpleadoPorId,
    crearEmpleado,
    actualizarEmpleado,
    eliminarEmpleado,
    eliminarMultiples,
    buscarEmpleados,
    obtenerEstadisticas,
    cargarEmpleados,
    setFiltros,
    cambiarPagina
  };
};

export default useEmpleados;