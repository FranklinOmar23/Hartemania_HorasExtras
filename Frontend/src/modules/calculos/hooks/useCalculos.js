import { useState, useCallback } from 'react';
import { calculosService } from '../../../services';
import { useUIStore } from '../../../store';

// ============================================
// HOOK PERSONALIZADO PARA CÁLCULOS
// ============================================

export const useCalculos = () => {
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useUIStore();

  // Estado para paginación
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
    totalItems: 0
  });

  // ========================================
  // OBTENER RESULTADOS DE UNA QUINCENA
  // ========================================
  const fetchResultados = useCallback(async (anio, mes, quincena, pagina = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await calculosService.obtenerResultadosQuincena(anio, mes, quincena);
      
      console.log('📦 Datos completos recibidos:', response);
      
      if (!response || !response.data) {
        console.warn('❌ Respuesta sin data:', response);
        setResultados(null);
        setLoading(false);
        return;
      }

      const data = response.data;
      
      if (data.resumen && Array.isArray(data.resumen)) {
        console.log(`✅ Encontrados ${data.resumen.length} empleados en data.resumen`);
        
        const empleadosRaw = data.resumen;
        const totalesRaw = data.totales || {};
        
        // Procesar datos
        const procesados = {
          totales: {
            horas35: totalesRaw.TotalHoras35 || 0,
            horas100: totalesRaw.TotalHoras100 || 0,
            horas15: totalesRaw.TotalHoras15 || 0,
            horasFeriado: totalesRaw.TotalHorasFeriado || 0,
            monto35: empleadosRaw.reduce((sum, emp) => sum + (emp.monto35 || emp.Monto35 || 0), 0),
            monto100: empleadosRaw.reduce((sum, emp) => sum + (emp.monto100 || emp.Monto100 || 0), 0),
            monto15: empleadosRaw.reduce((sum, emp) => sum + (emp.monto15 || emp.Monto15 || 0), 0),
            montoFeriado: empleadosRaw.reduce((sum, emp) => sum + (emp.montoFeriado || emp.MontoFeriado || 0), 0),
            totalHoras: totalesRaw.TotalHoras || 0,
            totalPagar: totalesRaw.TotalPagar || 0,
            cantidadEmpleados: empleadosRaw.length,
            empleadosConHE: empleadosRaw.filter(emp => {
              const horas = emp.horas || {};
              return (horas['35%'] || 0) + (horas['100%'] || 0) + (horas['15%'] || 0) + (horas.feriado || 0) > 0;
            }).length,
          },
          empleados: empleadosRaw.map(emp => {
            const empleadoInfo = emp.empleado || {};
            const horas = emp.horas || {};
            const montos = emp.montos || {};
            
            return {
              id: empleadoInfo.id || emp.id,
              codigo: empleadoInfo.codigo || '',
              nombre: empleadoInfo.nombreCompleto || 
                      (empleadoInfo.nombre && empleadoInfo.apellido 
                        ? `${empleadoInfo.nombre} ${empleadoInfo.apellido}`.trim()
                        : 'Sin nombre'),
              horas35: horas['35%'] || 0,
              horas100: horas['100%'] || 0,
              horas15: horas['15%'] || 0,
              horasFeriado: horas.feriado || 0,
              monto35: montos['35%'] || 0,
              monto100: montos['100%'] || 0,
              monto15: montos['15%'] || 0,
              montoFeriado: montos.feriado || 0,
              totalPagar: montos.total || 0
            };
          })
        };
        
        // Actualizar paginación
        setPaginacion(prev => ({
          ...prev,
          totalItems: procesados.empleados.length,
          totalPages: Math.ceil(procesados.empleados.length / prev.pageSize),
          currentPage: pagina
        }));
        
        console.log('✅ Datos procesados:', procesados.empleados.length, 'empleados');
        setResultados(procesados);
      } else {
        console.warn('❌ No se encontraron datos de empleados:', data);
        setResultados({
          totales: {
            horas35: 0, horas100: 0, horas15: 0, horasFeriado: 0,
            monto35: 0, monto100: 0, monto15: 0, montoFeriado: 0,
            totalHoras: 0, totalPagar: 0,
            cantidadEmpleados: 0, empleadosConHE: 0
          },
          empleados: []
        });
      }
      
    } catch (err) {
      console.error('❌ Error en fetchResultados:', err);
      setError(err.message);
      showToast({
        type: 'error',
        message: 'Error al cargar los resultados'
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // CAMBIAR PÁGINA
  // ========================================
  const cambiarPagina = useCallback((nuevaPagina, anio, mes, quincena) => {
    setPaginacion(prev => ({
      ...prev,
      currentPage: nuevaPagina
    }));
    // Si necesitas recargar datos del backend, descomenta:
    // fetchResultados(anio, mes, quincena, nuevaPagina);
  }, []);

  // ========================================
  // CAMBIAR TAMAÑO DE PÁGINA
  // ========================================
  const cambiarPageSize = useCallback((nuevoSize, anio, mes, quincena) => {
    setPaginacion(prev => ({
      ...prev,
      pageSize: nuevoSize,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / nuevoSize)
    }));
    // Si necesitas recargar datos del backend, descomenta:
    // fetchResultados(anio, mes, quincena, 1);
  }, []);

  // ========================================
  // CALCULAR QUINCENA
  // ========================================
  const calcularQuincena = useCallback(async (anio, mes, quincena) => {
    setLoading(true);
    setError(null);

    try {
      const result = await calculosService.calcularQuincena(anio, mes, quincena);

      console.log('✅ Resultado cálculo:', result);

      showToast({
        type: 'success',
        message: 'Quincena calculada correctamente'
      });

      // Recargar resultados después del cálculo
      await fetchResultados(anio, mes, quincena);

      return result;
    } catch (err) {
      console.error('❌ Error en calcularQuincena:', err);
      setError(err.message);
      showToast({
        type: 'error',
        message: err.message || 'Error al realizar el cálculo'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchResultados, showToast]);

  // ========================================
  // OBTENER DETALLE DE CÁLCULO
  // ========================================
  const obtenerDetalle = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const detalle = await calculosService.obtenerDetalle(id);
      return detalle;
    } catch (err) {
      setError(err.message);
      showToast({
        type: 'error',
        message: 'Error al cargar el detalle'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // LIMPIAR RESULTADOS
  // ========================================
  const limpiarResultados = useCallback(() => {
    setResultados(null);
    setError(null);
  }, []);

  // ========================================
  // EXPORTAR REPORTE
  // ========================================
  const exportarReporte = useCallback(async (anio, mes, quincena, formato) => {
    setLoading(true);

    try {
      const blob = await calculosService.exportarQuincena(anio, mes, quincena, formato);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HE_${anio}_${mes}_Q${quincena}.${formato}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        message: 'Reporte exportado correctamente'
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Error al exportar el reporte'
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    // Estado
    resultados,
    loading,
    error,
    paginacion,

    // Acciones
    fetchResultados,
    calcularQuincena,
    obtenerDetalle,
    limpiarResultados,
    exportarReporte,
    cambiarPagina,
    cambiarPageSize
  };
};

export default useCalculos;