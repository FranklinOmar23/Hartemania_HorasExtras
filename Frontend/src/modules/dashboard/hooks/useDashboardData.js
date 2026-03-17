import { useState, useCallback } from 'react';
import { reportesService, empleadosService, importacionService } from '../../../services';
import { useUIStore } from '../../../store';

// ============================================
// HOOK PERSONALIZADO PARA DATOS DEL DASHBOARD
// ============================================

export const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const { showToast } = useUIStore();

  // ========================================
  // OBTENER DATOS DEL DASHBOARD
  // ========================================
  const fetchDashboardData = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Obtener datos en paralelo
      const [
        empleados,
        importaciones
      ] = await Promise.all([
        empleadosService.obtenerTodos({ activo: true, limite: 100 }),
        importacionService.obtenerTodas({ limite: 5 })
      ]);

      // NOTA: Como no existe /reportes/dashboard en tu backend,
      // usamos otros endpoints para construir los datos
      
      // Obtener reporte mensual (primeros datos)
      let reporteMensual = null;
      try {
        reporteMensual = await reportesService.mensual(
          filtros.anio || new Date().getFullYear(),
          filtros.mes || new Date().getMonth() + 1,
          'json'
        );
      } catch (err) {
        console.warn('No se pudo obtener reporte mensual:', err);
      }

      // Obtener top empleados (usando reporte quincenal actual)
      let topEmpleados = [];
      try {
        const reporteQuincenal = await reportesService.quincenal(
          filtros.anio || new Date().getFullYear(),
          filtros.mes || new Date().getMonth() + 1,
          1, // Primera quincena
          'json'
        );
        topEmpleados = (reporteQuincenal?.empleados || []).slice(0, 5);
      } catch (err) {
        console.warn('No se pudo obtener top empleados:', err);
      }

      // Procesar datos para el frontend
      const processedData = {
        resumen: {
          totalHoras: reporteMensual?.resumen?.totalHoras || 0,
          totalPagar: reporteMensual?.resumen?.totalPagar || 0,
          empleadosActivos: empleados?.total || 0,
          empleadosConHE: reporteMensual?.resumen?.empleadosConHE || 0,
          diasConHE: reporteMensual?.resumen?.diasConHE || 0,
          diasLaborables: 22,
          limiteTrimestral: 68
        },

        horasPorTipo: {
          porDia: [],
          porTipo: [
            { name: '35%', value: reporteMensual?.resumen?.horasPorTipo?.he35 || 0 },
            { name: '100%', value: reporteMensual?.resumen?.horasPorTipo?.he100 || 0 },
            { name: '15%', value: reporteMensual?.resumen?.horasPorTipo?.he15 || 0 },
            { name: 'Feriado', value: reporteMensual?.resumen?.horasPorTipo?.feriado || 0 }
          ]
        },

        topEmpleados: topEmpleados.map(emp => ({
          id: emp.id,
          nombre: emp.nombre,
          codigo: emp.codigo,
          posicion: emp.posicion,
          totalHoras: emp.totalHoras || 0,
          totalPagar: emp.totalPagar || 0
        })),

        ultimasImportaciones: (importaciones?.data || []).map(imp => ({
          id: imp.id,
          nombreArchivo: imp.nombreArchivo,
          fecha: imp.fechaImportacion,
          totalRegistros: imp.totalRegistros,
          registrosValidos: imp.registrosValidos,
          registrosError: imp.registrosError,
          estado: imp.estado,
          usuario: imp.usuarioImportacion
        })),

        alertas: [] // Implementar según necesidad
      };

      setData(processedData);
      setUltimaActualizacion(new Date().toLocaleString());
      
      if (showToast) {
        showToast({
          type: 'success',
          message: 'Datos cargados correctamente'
        });
      }
      
    } catch (err) {
      console.error('Error en fetchDashboardData:', err);
      setError(err.message);
      if (showToast) {
        showToast({
          type: 'error',
          message: 'Error al cargar datos del dashboard'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    data,
    loading,
    error,
    ultimaActualizacion,
    fetchDashboardData
  };
};

export default useDashboardData;