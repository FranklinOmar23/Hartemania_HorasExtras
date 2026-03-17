import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  RefreshCw,
  FileText,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useImportacion } from '../hooks/useImportacion';
import { Button, Card, Badge, Spinner, Alert, Tabs } from '../../../components/common';
import { useUIStore } from '../../../store';
import { formatearFecha, formatearHora } from '../../../utils';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ============================================
// PÁGINA DE DETALLE DE IMPORTACIÓN
// ============================================

const ImportacionDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  
  const [importacion, setImportacion] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [errores, setErrores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');
  const [procesando, setProcesando] = useState(false);

  const { obtenerImportacion, obtenerRegistros, obtenerErrores, procesarImportacion } = useImportacion();

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [impData, regData, errData] = await Promise.all([
        obtenerImportacion(id),
        obtenerRegistros(id),
        obtenerErrores(id)
      ]);
      
      setImportacion(impData);
      setRegistros(regData || []);
      setErrores(errData || []);
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al cargar detalles de importación'
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // HANDLERS
  // ========================================
  const handleProcesar = async () => {
    setProcesando(true);
    try {
      await procesarImportacion(id);
      await cargarDatos();
      showToast({
        type: 'success',
        message: 'Importación procesada correctamente'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Error al procesar importación'
      });
    } finally {
      setProcesando(false);
    }
  };

  const handleExportarErrores = () => {
    if (errores.length === 0) return;

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(errores);
    XLSX.utils.book_append_sheet(wb, ws, 'Errores');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `errores_importacion_${id}.xlsx`);
  };

  const handleExportarRegistros = () => {
    if (registros.length === 0) return;

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(registros);
    XLSX.utils.book_append_sheet(wb, ws, 'Registros');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `registros_importacion_${id}.xlsx`);
  };

  // ========================================
  // CONFIGURACIÓN DE ESTADOS
  // ========================================
  const getEstadoConfig = (estado) => {
    const estados = {
      PENDIENTE: {
        label: 'Pendiente',
        icon: Clock,
        color: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-500'
      },
      PROCESADO: {
        label: 'Procesado',
        icon: CheckCircle,
        color: 'bg-green-100',
        textColor: 'text-green-800',
        iconColor: 'text-green-500'
      },
      ERROR: {
        label: 'Error',
        icon: AlertCircle,
        color: 'bg-red-100',
        textColor: 'text-red-800',
        iconColor: 'text-red-500'
      }
    };
    return estados[estado] || estados.PENDIENTE;
  };

  // ========================================
  // RENDER DE SECCIONES
  // ========================================
  const renderResumen = () => {
    if (!importacion) return null;
    
    const estado = getEstadoConfig(importacion.estado);
    const EstadoIcon = estado.icon;

    return (
      <div className="space-y-6">
        {/* Información general */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Archivo</p>
            <div className="flex items-center">
              <FileText size={16} className="text-gray-400 mr-2" />
              <p className="font-medium text-gray-900 truncate">
                {importacion.nombreArchivo}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Fecha importación</p>
            <div className="flex items-center">
              <Calendar size={16} className="text-gray-400 mr-2" />
              <p className="font-medium text-gray-900">
                {formatearFecha(importacion.fechaImportacion)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Usuario</p>
            <div className="flex items-center">
              <User size={16} className="text-gray-400 mr-2" />
              <p className="font-medium text-gray-900">
                {importacion.usuario || 'Sistema'}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Estado</p>
            <div className="flex items-center">
              <EstadoIcon size={16} className={`${estado.iconColor} mr-2`} />
              <Badge variant={
                importacion.estado === 'PROCESADO' ? 'success' :
                importacion.estado === 'ERROR' ? 'danger' : 'warning'
              }>
                {estado.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {importacion.totalRegistros || 0}
            </p>
            <p className="text-sm text-blue-600">Total registros</p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg text-center">
            <p className="text-3xl font-bold text-green-600 mb-2">
              {importacion.registrosValidos || 0}
            </p>
            <p className="text-sm text-green-600">Registros válidos</p>
          </div>

          <div className="bg-red-50 p-6 rounded-lg text-center">
            <p className="text-3xl font-bold text-red-600 mb-2">
              {importacion.registrosError || 0}
            </p>
            <p className="text-sm text-red-600">Registros con error</p>
          </div>
        </div>

        {/* Botones de acción */}
        {importacion.estado === 'PENDIENTE' && (
          <div className="flex justify-end space-x-3">
            <Button
              variant="primary"
              onClick={handleProcesar}
              loading={procesando}
              icon={RefreshCw}
            >
              Procesar importación
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderRegistros = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Registros importados ({registros.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportarRegistros}
          icon={Download}
          disabled={registros.length === 0}
        >
          Exportar
        </Button>
      </div>

      {registros.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay registros para mostrar
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Empleado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entrada
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Salida
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registros.map((reg, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatearFecha(reg.fecha)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                    {reg.codigo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {reg.nombre}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {reg.horaEntrada ? formatearHora(reg.horaEntrada) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {reg.horaSalida ? formatearHora(reg.horaSalida) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={reg.valido ? 'success' : 'danger'} size="sm">
                      {reg.valido ? 'Válido' : 'Error'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderErrores = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Errores de importación ({errores.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportarErrores}
          icon={Download}
          disabled={errores.length === 0}
        >
          Exportar
        </Button>
      </div>

      {errores.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No se encontraron errores
        </div>
      ) : (
        <div className="space-y-3">
          {errores.map((error, idx) => (
            <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Fila {error.fila}: {error.codigoEmpleado} - {error.error}
                  </p>
                  {error.datosRaw && (
                    <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                      {JSON.stringify(JSON.parse(error.datosRaw), null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ========================================
  // RENDER PRINCIPAL
  // ========================================
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" text="Cargando detalles..." />
      </div>
    );
  }

  if (!importacion) {
    return (
      <Alert
        type="error"
        title="Error"
        message="No se encontró la importación solicitada"
      />
    );
  }

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'registros', label: `Registros (${registros.length})` },
    { id: 'errores', label: `Errores (${errores.length})` }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/importacion')}
          icon={ArrowLeft}
        >
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Detalle de Importación
          </h1>
          <p className="text-gray-500 mt-1">
            {importacion.nombreArchivo}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido */}
      <Card>
        {activeTab === 'resumen' && renderResumen()}
        {activeTab === 'registros' && renderRegistros()}
        {activeTab === 'errores' && renderErrores()}
      </Card>
    </div>
  );
};

export default ImportacionDetallePage;