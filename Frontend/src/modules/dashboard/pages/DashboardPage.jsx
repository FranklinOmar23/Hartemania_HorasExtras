import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, 
  Calendar, 
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import SummaryCards from '../components/SummaryCards';
import HorasExtrasChart from '../components/HorasExtrasChart';
import TopEmpleados from '../components/TopEmpleados';
import UltimasImportaciones from '../components/UltimasImportaciones';
import AlertasLimite from '../components/AlertasLimite';
import { Button, Card, Spinner, Alert } from '../../../components/common';
import { useUIStore } from '../../../store';

// ============================================
// SELECTOR DE MES/AÑO
// ============================================
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MonthYearSelector = ({ value, onChange }) => {
  const mes = value.getMonth();
  const anio = value.getFullYear();

  const prev = () => {
    const d = new Date(anio, mes - 1, 1);
    onChange(d);
  };
  const next = () => {
    const d = new Date(anio, mes + 1, 1);
    onChange(d);
  };

  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 sm:w-auto sm:justify-normal">
      <button type="button" onClick={prev} className="p-1 hover:bg-gray-100 rounded">
        <ChevronLeft size={16} />
      </button>
      <span className="min-w-0 flex-1 text-center text-sm font-medium text-gray-700 sm:min-w-[140px] sm:flex-none">
        {MESES[mes]} {anio}
      </span>
      <button type="button" onClick={next} className="p-1 hover:bg-gray-100 rounded">
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

// ============================================
// PÁGINA PRINCIPAL DEL DASHBOARD
// ============================================

const DashboardPage = () => {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  
  // Estado para filtros
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Hook personalizado
  const {
    data,
    loading,
    error,
    fetchDashboardData,
    ultimaActualizacion
  } = useDashboardData();

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    cargarDatos();
  }, [selectedMonth]);

  // ========================================
  // FUNCIONES
  // ========================================
  const cargarDatos = async () => {
    try {
      await fetchDashboardData({
        mes: selectedMonth.getMonth() + 1,
        anio: selectedMonth.getFullYear()
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al cargar los datos del dashboard'
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
    
    showToast({
      type: 'success',
      message: 'Datos actualizados correctamente'
    });
  };

  const handleMonthChange = (date) => {
    setSelectedMonth(date);
  };

  const handleVerReporteCompleto = () => {
    navigate('/reportes');
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Resumen de horas extras y actividad reciente
          </p>
          {ultimaActualizacion && (
            <p className="text-xs text-gray-400 mt-1">
              Última actualización: {ultimaActualizacion}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto lg:flex-nowrap">
          {/* Selector de mes */}
          <MonthYearSelector
            value={selectedMonth}
            onChange={handleMonthChange}
          />

          {/* Botón de actualizar */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            loading={refreshing}
            icon={RefreshCw}
            className="w-full sm:w-auto"
          >
            Actualizar
          </Button>

          {/* Botón de reportes */}
          <Button
            variant="primary"
            onClick={handleVerReporteCompleto}
            icon={Download}
            className="w-full sm:w-auto"
          >
            Reporte Completo
          </Button>
        </div>
      </div>

      {/* Estado de carga */}
      {loading && !refreshing && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" text="Cargando dashboard..." />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <Alert
          type="error"
          title="Error al cargar datos"
          message={error}
          dismissible
        />
      )}

      {/* Contenido del dashboard */}
      {!loading && !error && data && (
        <div className="space-y-6">
          {/* Tarjetas de resumen */}
          <SummaryCards 
            data={data.resumen}
            periodo={{
              mes: selectedMonth.getMonth() + 1,
              anio: selectedMonth.getFullYear()
            }}
          />

          {/* Alertas de límite legal */}
          {data.alertas && data.alertas.length > 0 && (
            <AlertasLimite alertas={data.alertas} />
          )}

          {/* Gráficos y tablas en grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {/* Gráfico de horas extras (ocupa 2 columnas en lg) */}
            <div className="md:col-span-2 lg:col-span-2">
              <HorasExtrasChart 
                data={data.horasPorTipo}
                loading={loading}
                tieneQuincenas={data.resumen?.tieneQuincenas}
              />
            </div>

            {/* Top empleados (ocupa 1 columna) */}
            <div className="lg:col-span-1">
              <TopEmpleados 
                empleados={data.topEmpleados}
                loading={loading}
                onVerTodos={() => navigate('/empleados')}
                tieneQuincenas={data.resumen?.tieneQuincenas}
              />
            </div>
          </div>

          {/* Últimas importaciones */}
          <UltimasImportaciones 
            importaciones={data.ultimasImportaciones}
            loading={loading}
            onVerTodas={() => navigate('/importacion')}
          />

          {/* Mensaje si no hay datos */}
          {(!data.resumen || Object.keys(data.resumen).length === 0) && (
            <Card>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay datos para este período
                </h3>
                <p className="text-gray-500 mb-4">
                  Selecciona otro mes o importa datos para ver el dashboard
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/importacion')}
                >
                  Importar datos
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;