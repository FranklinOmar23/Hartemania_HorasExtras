import { useState, useCallback } from 'react';
import { get } from '../../../services/api';

// ============================================
// HOOK PERSONALIZADO PARA DATOS DEL DASHBOARD
// ============================================

export const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  const fetchDashboardData = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);

    const anio = filtros.anio || new Date().getFullYear();
    const mes = filtros.mes || new Date().getMonth() + 1;

    try {
      const response = await get('/dashboard', { anio, mes });
      const d = response.data.data;

      const resumen = d.resumen || {};
      const tieneQuincenas = resumen.tieneQuincenas;

      // Datos para grafico de barras
      let porDia = [];
      if (tieneQuincenas && d.horasPorDia?.length > 0) {
        porDia = d.horasPorDia;
      } else if (d.registrosPorDia?.length > 0) {
        // Sin quincenas: mostrar registros por dia
        porDia = d.registrosPorDia.map(r => {
          const f = r.fecha;
          const dia = f ? f.substring(8, 10) + '/' + f.substring(5, 7) : '';
          return {
            dia,
            'Registros': r.totalRegistros,
            'Empleados': r.empleados
          };
        });
      }

      // Datos para grafico de pastel
      let porTipo = [];
      if (tieneQuincenas) {
        porTipo = [
          { name: 'HE 35%', value: resumen.horasPorTipo?.he35 || 0, color: '#3B82F6' },
          { name: 'HE 100%', value: resumen.horasPorTipo?.he100 || 0, color: '#10B981' },
          { name: 'HE 15%', value: resumen.horasPorTipo?.he15 || 0, color: '#F59E0B' },
          { name: 'Feriado', value: resumen.horasPorTipo?.feriado || 0, color: '#EF4444' }
        ];
      }

      const processedData = {
        resumen: {
          totalHoras: resumen.totalHoras || 0,
          totalPagar: resumen.totalPagar || 0,
          empleadosActivos: resumen.empleadosActivos || 0,
          empleadosConHE: resumen.empleadosConHE || 0,
          totalRegistros: resumen.totalRegistros || 0,
          empleadosConRegistros: resumen.empleadosConRegistros || 0,
          diasConRegistros: resumen.diasConRegistros || 0,
          diasConHE: resumen.diasConRegistros || 0,
          diasLaborables: 22,
          limiteTrimestral: 68,
          tieneQuincenas
        },
        horasPorTipo: { porDia, porTipo },
        topEmpleados: (d.topEmpleados || []).map(e => ({
          id: e.id,
          codigo: e.codigo,
          nombre: e.nombre,
          posicion: e.posicion,
          totalHoras: e.totalHoras || 0,
          totalPagar: e.totalPagar || 0,
          totalRegistros: e.totalRegistros || 0
        })),
        ultimasImportaciones: (d.ultimasImportaciones || []).map(imp => ({
          id: imp.id,
          nombreArchivo: imp.nombreArchivo,
          fecha: imp.fecha,
          totalRegistros: imp.totalRegistros || 0,
          registrosValidos: imp.registrosValidos || 0,
          registrosError: imp.registrosError || 0,
          estado: imp.estado || 'PROCESADO',
          usuario: imp.usuario || ''
        })),
        alertas: []
      };

      setData(processedData);
      setUltimaActualizacion(new Date().toLocaleString());
    } catch (err) {
      console.error('Error en fetchDashboardData:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, ultimaActualizacion, fetchDashboardData };
};

export default useDashboardData;