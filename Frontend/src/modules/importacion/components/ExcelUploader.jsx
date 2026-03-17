import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button, Alert } from '../../../components/common';

// ============================================
// COMPONENTE EXCEL UPLOADER
// Drag & drop para archivos Excel
// ============================================

const ExcelUploader = ({ onFileSelect, loading = false }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  // ========================================
  // CONFIGURACIÓN DE DROPZONE
  // ========================================
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Limpiar errores anteriores
    setError(null);

    console.log('📥 Archivos aceptados:', acceptedFiles);
    console.log('📥 Archivos rechazados:', rejectedFiles);

    // Manejar archivos rechazados
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles[0].errors.map(e => e.message).join(', ');
      setError(`Archivo no válido: ${errors}`);
      return;
    }

    // Manejar archivo aceptado
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      console.log('✅ Archivo seleccionado en ExcelUploader:', selectedFile.name, selectedFile.size);
      
      // Validar tamaño (máximo 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('El archivo no puede ser mayor a 10MB');
        return;
      }

      setFile(selectedFile);
      // ✅ Llamar a onFileSelect con el archivo
      if (onFileSelect) {
        onFileSelect(selectedFile);
      } else {
        console.error('❌ onFileSelect no está definido');
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    disabled: loading
  });

  // ========================================
  // HANDLERS
  // ========================================
  const removeFile = () => {
    setFile(null);
    setError(null);
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${loading ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <Upload className={`mx-auto h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Suelta el archivo aquí'
            : 'Arrastra y suelta tu archivo Excel aquí'
          }
        </p>
        
        <p className="text-xs text-gray-500 mt-1">
          o haz clic para seleccionar
        </p>
        
        <p className="text-xs text-gray-400 mt-2">
          Formatos soportados: .xlsx, .xls, .csv (Máx. 10MB)
        </p>
      </div>

      {/* Archivo seleccionado */}
      {file && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <File className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert
          type="error"
          message={error}
          dismissible
          onDismiss={() => setError(null)}
        />
      )}

      {/* Instrucciones */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-2">Instrucciones:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>El archivo debe tener una fila de encabezados</li>
          <li>Columnas requeridas: Fecha, Código, Nombre, Hora Entrada, Hora Salida</li>
          <li>Las fechas deben estar en formato YYYY-MM-DD</li>
          <li>Las horas deben estar en formato HH:MM (ej: 08:30, 17:30)</li>
          <li>Usar "--" para indicar marcación faltante</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelUploader;