import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Download
} from 'lucide-react';
import { useImportacion } from '../hooks/useImportacion';
import { usePreviewExcel } from '../hooks/usePreviewExcel';
import ExcelUploader from '../components/ExcelUploader';
import PreviewTable from '../components/PreviewTable';
import ValidationErrors from '../components/ValidationErrors';
import MapeoColumnas from '../components/MapeoColumnas';
import HistorialImportaciones from '../components/HistorialImportaciones';
import ImportacionStatus from '../components/ImportacionStatus';
import { Button, Card, Tabs, Alert, Spinner } from '../../../components/common';
import { useUIStore } from '../../../store';

// ============================================
// PÁGINA PRINCIPAL DE IMPORTACIÓN
// ============================================

const ImportacionPage = () => {
  const navigate = useNavigate();
  const { showToast } = useUIStore();

  // Estado
  const [activeTab, setActiveTab] = useState('importar');
  const [archivo, setArchivo] = useState(null);
  const [paso, setPaso] = useState('upload'); // upload, preview, mapeo, procesando, resultado
  const [datosPreview, setDatosPreview] = useState(null);
  const [erroresValidacion, setErroresValidacion] = useState([]);
  const [mapeo, setMapeo] = useState({});
  const [resultadoImportacion, setResultadoImportacion] = useState(null);

  // Hooks personalizados
  const {
    importando,
    importarArchivo,
    validarArchivo,
    procesarImportacion,
    obtenerHistorial
  } = useImportacion();

  const {
    previewData,
    loading: previewLoading,
    error: previewError,
    generarPreview,
    limpiarPreview,
    validarEstructura
  } = usePreviewExcel();

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    cargarHistorial();
  }, []);

  // ========================================
  // FUNCIONES
  // ========================================
  const cargarHistorial = async () => {
    try {
      await obtenerHistorial();
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const handleFileSelect = async (file) => {
    console.log('📥 handleFileSelect recibió en ImportacionPage:', file);

    if (!file) {
      console.error('❌ No se recibió archivo');
      showToast({
        type: 'error',
        message: 'No se seleccionó ningún archivo'
      });
      return;
    }

    setArchivo(file);
    setErroresValidacion([]);

    showToast({
      type: 'info',
      message: 'Validando archivo...'
    });

    try {
      // Validar archivo
      console.log('🔍 Llamando a validarArchivo con:', file.name, file.size);
      const validation = await validarArchivo(file);
      console.log('✅ Validación recibida en handleFileSelect:', validation);

      // Verificar la estructura de la respuesta
      let esValido = false;
      let mensajeError = '';

      if (validation && typeof validation === 'object') {
        // Si tiene propiedad 'valido'
        if (validation.valido !== undefined) {
          esValido = validation.valido;
          mensajeError = validation.error || validation.mensaje || '';
        }
        // Si tiene propiedad 'success'
        else if (validation.success !== undefined) {
          esValido = validation.success;
          mensajeError = validation.error || validation.message || '';
        }
        // Si es un array o tiene datos
        else if (validation.registros || validation.data) {
          esValido = true;
        }
      }

      console.log('📊 Resultado validación:', { esValido, mensajeError });

      if (!esValido) {
        setErroresValidacion([{
          tipo: 'error',
          mensaje: mensajeError || 'El archivo no es válido'
        }]);
        showToast({
          type: 'error',
          message: mensajeError || 'El archivo no es válido'
        });
        return;
      }

      // Generar preview
      showToast({
        type: 'info',
        message: 'Generando vista previa...'
      });

      const preview = await generarPreview(file);
      console.log('Preview generado:', preview);

      if (preview && preview.registros && preview.registros.length > 0) {
        setDatosPreview(preview);
        setPaso('preview');

        showToast({
          type: 'success',
          message: `Se encontraron ${preview.registros.length} registros`
        });
      } else {
        setErroresValidacion([{
          tipo: 'sin_datos',
          mensaje: 'El archivo no contiene registros válidos'
        }]);
        showToast({
          type: 'warning',
          message: 'El archivo no contiene registros válidos'
        });
      }

    } catch (error) {
      console.error('❌ Error al procesar archivo:', error);
      setErroresValidacion([{
        tipo: 'error',
        mensaje: error.message || 'Error al procesar el archivo'
      }]);
      showToast({
        type: 'error',
        message: error.message || 'Error al validar el archivo'
      });
    }
  };

  const handleConfirmarPreview = () => {
    setPaso('mapeo');
  };

  const handleAtras = () => {
    if (paso === 'mapeo') {
      setPaso('preview');
    } else if (paso === 'preview') {
      setPaso('upload');
      limpiarPreview();
      setArchivo(null);
      setDatosPreview(null);
      setErroresValidacion([]);
    }
  };

  const handleMapeoChange = (nuevoMapeo) => {
    setMapeo(nuevoMapeo);
  };

  const handleImportar = async () => {
    if (!archivo) {
      showToast({
        type: 'error',
        message: 'No hay archivo para importar'
      });
      return;
    }

    setPaso('procesando');

    try {
      const resultado = await importarArchivo(archivo, mapeo);
      console.log('Resultado importación:', resultado);

      setResultadoImportacion(resultado);
      setPaso('resultado');

      showToast({
        type: 'success',
        message: `Importación completada: ${resultado?.registrosValidos || 0} registros válidos`
      });

      // Recargar historial
      await obtenerHistorial();
    } catch (error) {
      console.error('Error al importar:', error);
      showToast({
        type: 'error',
        message: error.message || 'Error al importar el archivo'
      });
      setPaso('upload');
    }
  };

  const handleVerDetalle = (id) => {
    navigate(`/importacion/${id}`);
  };

  const handleDescargarPlantilla = () => {
    showToast({
      type: 'info',
      message: 'Descargando plantilla...'
    });
    // Aquí iría la lógica real de descarga
    // importacionService.descargarPlantilla();
  };

  // ========================================
  // TABS
  // ========================================
  const tabs = [
    { id: 'importar', label: 'Importar Archivo', icon: Upload },
    { id: 'historial', label: 'Historial', icon: Clock }
  ];

  // ========================================
  // RENDER DE PASOS
  // ========================================
  const renderUpload = () => (
    <div className="space-y-6">
      <ExcelUploader
        onFileSelect={handleFileSelect}
        loading={importando || previewLoading}
      />

      {erroresValidacion.length > 0 && (
        <ValidationErrors
          errors={erroresValidacion}
          onClose={() => setErroresValidacion([])}
        />
      )}

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Formato esperado:</strong> El archivo debe contener las columnas:
              Fecha, Código, Nombre, Hora Entrada, Hora Salida.
            </p>
            <button
              onClick={handleDescargarPlantilla}
              className="text-sm text-blue-700 underline mt-2 inline-flex items-center"
            >
              <Download size={14} className="mr-1" />
              Descargar plantilla de ejemplo
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Vista previa de datos
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Revisa los datos antes de continuar
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleAtras}>
            Atrás
          </Button>
          <Button variant="primary" onClick={handleConfirmarPreview} icon={ArrowRight}>
            Continuar
          </Button>
        </div>
      </div>

      {previewLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" text="Generando vista previa..." />
        </div>
      ) : previewError ? (
        <Alert type="error" message={previewError} />
      ) : datosPreview ? (
        <PreviewTable
          data={datosPreview}
          fileName={archivo?.name}
        />
      ) : (
        <Alert type="warning" message="No se pudieron cargar los datos" />
      )}
    </div>
  );

  const renderMapeo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Mapeo de columnas
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Indica qué columna corresponde a cada campo
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleAtras}>
            Atrás
          </Button>
          <Button
            variant="success"
            onClick={handleImportar}
            loading={importando}
            icon={Upload}
          >
            Importar
          </Button>
        </div>
      </div>

      <MapeoColumnas
        columnas={datosPreview?.columnas || []}
        onMapeoChange={handleMapeoChange}
      />
    </div>
  );

  const renderResultado = () => (
    <div className="space-y-6">
      <ImportacionStatus
        resultado={resultadoImportacion}
        onVerDetalle={() => handleVerDetalle(resultadoImportacion?.id)}
        onNuevaImportacion={() => {
          setPaso('upload');
          setArchivo(null);
          setDatosPreview(null);
          setResultadoImportacion(null);
          setErroresValidacion([]);
          limpiarPreview();
        }}
      />
    </div>
  );

  const renderProcesando = () => (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Procesando importación
      </h3>
      <p className="text-gray-500">
        Esto puede tomar unos momentos...
      </p>
      <p className="text-xs text-gray-400 mt-4">
        Archivo: {archivo?.name}
      </p>
    </div>
  );

  // ========================================
  // RENDER PRINCIPAL
  // ========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importación de Datos</h1>
        <p className="text-gray-500 mt-1">
          Importa archivos Excel con registros de asistencia
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'importar') {
                  setPaso('upload');
                }
              }}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon size={18} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido */}
      <Card>
        {activeTab === 'importar' && (
          <>
            {paso === 'upload' && renderUpload()}
            {paso === 'preview' && renderPreview()}
            {paso === 'mapeo' && renderMapeo()}
            {paso === 'procesando' && renderProcesando()}
            {paso === 'resultado' && renderResultado()}
          </>
        )}

        {activeTab === 'historial' && (
          <HistorialImportaciones
            onVerDetalle={handleVerDetalle}
          />
        )}
      </Card>
    </div>
  );
};

export default ImportacionPage;