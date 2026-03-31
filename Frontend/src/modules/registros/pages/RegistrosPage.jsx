import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  List, 
  RefreshCw, 
  Download, 
  Filter, 
  X 
} from 'lucide-react';
import { useRegistros } from '../hooks/useRegistros';
import RegistrosTable from '../components/RegistrosTable';
import RegistroFilter from '../components/RegistroFilter';
import RegistroCalendario from '../components/RegistroCalendario';
import RegistroDetalleModal from '../components/RegistroDetalleModal';
import { Button, Card, Alert, Spinner } from '../../../components/common';
import { useUIStore } from '../../../store';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ============================================
// PÁGINA PRINCIPAL DE REGISTROS
// ============================================

const RegistrosPage = () => {
  const navigate = useNavigate();
  const { showToast, openConfirmModal } = useUIStore();

  const formatDateLabel = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString();
  };
  
  // Estado
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'calendar'
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Hook personalizado
  const {
    registros,
    loading,
    error,
    filtros,
    paginacion,
    fetchRegistros,
    setFiltros,
    cambiarPagina,
    eliminarRegistro
  } = useRegistros();

  const tieneFiltrosActivos = Boolean(
    filtros?.search || filtros?.fechaInicio || filtros?.fechaFin || filtros?.empleadoId || filtros?.tipo
  );

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    cargarRegistros();
  }, [filtros, paginacion.currentPage]);

  // ========================================
  // FUNCIONES
  // ========================================
  const cargarRegistros = async () => {
    try {
      await fetchRegistros({
        ...filtros,
        pagina: paginacion.currentPage,
        limite: paginacion.pageSize
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al cargar registros'
      });
    }
  };

  const handleNuevoRegistro = () => {
    navigate('/registros/manual');
  };

  const handleVerDetalle = (registro) => {
    setSelectedRegistro(registro);
    setDetalleModalOpen(true);
  };

  const handleEditar = (registro) => {
    navigate(`/registros/manual?id=${registro.id}`);
  };

  const handleEliminar = (registro) => {
    openConfirmModal({
      title: 'Eliminar registro',
      message: `¿Estás seguro de eliminar el registro del ${new Date(registro.fecha).toLocaleDateString()}?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await eliminarRegistro(registro.id);
          showToast({
            type: 'success',
            message: 'Registro eliminado correctamente'
          });
        } catch (error) {
          showToast({
            type: 'error',
            message: 'Error al eliminar registro'
          });
        }
      }
    });
  };

  const handleRefresh = () => {
    cargarRegistros();
    showToast({
      type: 'info',
      message: 'Datos actualizados'
    });
  };

  const handleExportar = async () => {
    setExportando(true);
    try {
      const wb = XLSX.utils.book_new();
      
      const exportData = registros.map(reg => ({
        Fecha: new Date(reg.fecha).toLocaleDateString(),
        Empleado: reg.empleadoNombre,
        'Código': reg.codigoEmpleado,
        'Hora Entrada': reg.horaEntrada || '—',
        'Hora Salida': reg.horaSalida || '—',
        'HE 35%': reg.he35 || 0,
        'HE 100%': reg.he100 || 0,
        'HE 15%': reg.he15 || 0,
        'HE Feriado': reg.heFeriado || 0,
        'Total Horas': reg.totalHoras || 0,
        'Tipo': reg.tipoRegistro,
        Comentarios: reg.comentarios || ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Registros');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, `registros_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      showToast({
        type: 'success',
        message: 'Registros exportados correctamente'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al exportar registros'
      });
    } finally {
      setExportando(false);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setFiltros({
      search: '',
      fechaInicio: '',
      fechaFin: '',
      empleadoId: '',
      tipo: '',
      pagina: 1
    });
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registros</h1>
          <p className="text-gray-500 mt-1">
            Gestiona los registros de entrada y salida de empleados
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Toggle vista - Tabla/Calendario */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                viewMode === 'table'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Vista tabla"
            >
              <List size={16} className="mr-2" />
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                viewMode === 'calendar'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Vista calendario"
            >
              <Calendar size={16} className="mr-2" />
              <span className="hidden sm:inline">Calendario</span>
            </button>
          </div>

          {/* Botón Filtros */}
          <Button
            variant="outline"
            onClick={toggleFilters}
            icon={Filter}
            className={showFilters ? 'bg-blue-50 text-blue-600 border-blue-300' : ''}
          >
            Filtros
          </Button>

          {/* Botón Exportar */}
          <Button
            variant="outline"
            onClick={handleExportar}
            loading={exportando}
            icon={Download}
          >
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          
          {/* Botón Actualizar */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            icon={RefreshCw}
          />
          
          {/* Botón Nuevo Registro */}
          <Button
            variant="primary"
            onClick={handleNuevoRegistro}
            icon={Plus}
          >
            <span className="hidden sm:inline">Nuevo Registro</span>
          </Button>
        </div>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <Card className="animate-slide-down">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <X size={14} className="mr-1" />
              Limpiar filtros
            </button>
          </div>
          <RegistroFilter
            filtros={filtros}
            onChange={setFiltros}
            onSearch={cargarRegistros}
          />
        </Card>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" text="Cargando registros..." />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <Alert
          type="error"
          title="Error al cargar registros"
          message={error}
          dismissible
          onDismiss={() => setError(null)}
        />
      )}

      {/* Contenido según vista */}
      {!loading && !error && (
        <Card>
          {viewMode === 'table' ? (
            <RegistrosTable
              registros={registros}
              loading={loading}
              onVerDetalle={handleVerDetalle}
              onEditar={handleEditar}
              onEliminar={handleEliminar}
              paginacion={paginacion}
              onPageChange={cambiarPagina}
            />
          ) : (
            <RegistroCalendario
              registros={registros}
              onSelectDate={(date) => {
                const selected = new Date(date).toISOString().split('T')[0];
                setFiltros({ ...filtros, fechaInicio: selected, fechaFin: selected, pagina: 1 });
                setViewMode('table');
                setShowFilters(true);
              }}
              onSelectRegistro={handleVerDetalle}
            />
          )}
        </Card>
      )}

      {/* Mensaje cuando no hay registros */}
      {!loading && !error && registros.length === 0 && (
        <Card className="overflow-hidden rounded-[30px] border border-slate-200 shadow-sm">
          <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50 px-6 py-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-white shadow-sm">
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              {tieneFiltrosActivos ? 'No se encontraron registros en este rango' : 'Todavia no hay registros disponibles'}
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500">
              {tieneFiltrosActivos
                ? 'Prueba ajustando el rango de fechas, cambiando el tipo de registro o limpiando los filtros para ver mas resultados.'
                : 'Cuando importes datos desde Excel o crees registros manuales, apareceran aqui con su detalle y calculos asociados.'}
            </p>

            {tieneFiltrosActivos && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
                {filtros.fechaInicio && (
                  <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-blue-700">
                    Desde: {formatDateLabel(filtros.fechaInicio)}
                  </span>
                )}
                {filtros.fechaFin && (
                  <span className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-cyan-700">
                    Hasta: {formatDateLabel(filtros.fechaFin)}
                  </span>
                )}
                {filtros.tipo && (
                  <span className="rounded-full border border-violet-200 bg-white px-3 py-1 text-violet-700">
                    Tipo: {filtros.tipo}
                  </span>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {tieneFiltrosActivos ? (
                <>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                  <Button variant="primary" onClick={handleRefresh}>
                    Volver a cargar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/importacion')}
                  >
                    Importar Excel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNuevoRegistro}
                  >
                    Nuevo Registro Manual
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Modal de detalle */}
      <RegistroDetalleModal
        isOpen={detalleModalOpen}
        onClose={() => {
          setDetalleModalOpen(false);
          setSelectedRegistro(null);
        }}
        registro={selectedRegistro}
        onEditar={handleEditar}
      />

      {/* Resumen de filtros activos */}
      {tieneFiltrosActivos && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-sm text-blue-700 font-medium">Filtros activos:</span>
            {filtros.search && (
              <span className="bg-white px-2 py-1 rounded text-xs text-blue-600 border border-blue-200">
                Búsqueda: {filtros.search}
              </span>
            )}
            {filtros.fechaInicio && (
              <span className="bg-white px-2 py-1 rounded text-xs text-blue-600 border border-blue-200">
                Desde: {formatDateLabel(filtros.fechaInicio)}
              </span>
            )}
            {filtros.fechaFin && (
              <span className="bg-white px-2 py-1 rounded text-xs text-blue-600 border border-blue-200">
                Hasta: {formatDateLabel(filtros.fechaFin)}
              </span>
            )}
            {filtros.empleadoId && (
              <span className="bg-white px-2 py-1 rounded text-xs text-blue-600 border border-blue-200">
                Empleado ID: {filtros.empleadoId}
              </span>
            )}
            {filtros.tipo && (
              <span className="bg-white px-2 py-1 rounded text-xs text-blue-600 border border-blue-200">
                Tipo: {filtros.tipo}
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
          >
            <X size={12} className="mr-1" />
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
};

export default RegistrosPage;