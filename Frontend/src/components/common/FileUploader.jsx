import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react';
import { FILE_CONFIG } from '../../config/constants';
import Button from './Button';
import Alert from './Alert';

// ============================================
// COMPONENTE FILEUPLOADER
// Drag & drop para subir archivos
// ============================================

const FileUploader = ({
  onUpload,
  accept = FILE_CONFIG.ALLOWED_TYPES,
  maxSize = FILE_CONFIG.MAX_SIZE,
  multiple = false,
  maxFiles = 1,
  label = 'Arrastra y suelta archivos aquí',
  hint = 'O haz clic para seleccionar',
  showPreview = true,
  className = '',
  disabled = false,
  onError
}) => {
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  // ========================================
  // CONFIGURACIÓN DE DROPZONE
  // ========================================
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Manejar archivos aceptados
    if (acceptedFiles.length > 0) {
      setFiles(prev => {
        if (multiple) {
          return [...prev, ...acceptedFiles];
        }
        return [acceptedFiles[0]];
      });
    }

    // Manejar archivos rechazados
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(file => ({
        file: file.file,
        errors: file.errors.map(e => e.message)
      }));
      
      setErrors(prev => [...prev, ...newErrors]);
      
      if (onError) {
        onError(newErrors);
      }
    }
  }, [multiple, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, ext) => ({ ...acc, [ext]: [] }), {}),
    maxSize,
    multiple,
    maxFiles,
    disabled
  });

  // ========================================
  // HANDLERS
  // ========================================
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeError = (index) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setErrors([]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      await onUpload(files);
      clearAll();
    } catch (error) {
      setErrors(prev => [...prev, { file: null, errors: [error.message] }]);
    } finally {
      setUploading(false);
    }
  };

  // ========================================
  // FORMATO DE TAMAÑO
  // ========================================
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={className}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <Upload className={`mx-auto h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive ? 'Suelta los archivos aquí' : label}
        </p>
        
        <p className="text-xs text-gray-500 mt-1">
          {hint}
        </p>
        
        <p className="text-xs text-gray-400 mt-2">
          Tamaño máximo: {formatFileSize(maxSize)} | Formatos: {accept.join(', ')}
        </p>
      </div>

      {/* Lista de archivos seleccionados */}
      {files.length > 0 && showPreview && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900">
              Archivos seleccionados ({files.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
            >
              Limpiar todos
            </Button>
          </div>

          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
          ))}

          {/* Botón de subir */}
          <Button
            variant="primary"
            onClick={handleUpload}
            loading={uploading}
            fullWidth
            className="mt-4"
          >
            Subir {files.length > 1 ? `${files.length} archivos` : 'archivo'}
          </Button>
        </div>
      )}

      {/* Errores */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((error, index) => (
            <Alert
              key={index}
              type="error"
              message={error.file ? `${error.file.name}: ${error.errors.join(', ')}` : error.errors.join(', ')}
              dismissible
              onDismiss={() => removeError(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// EXCEL UPLOADER (especializado)
// ============================================
export const ExcelUploader = (props) => {
  return (
    <FileUploader
      accept={['.xlsx', '.xls', '.csv']}
      maxSize={10 * 1024 * 1024} // 10MB
      label="Arrastra tu archivo Excel aquí"
      hint="Formatos soportados: .xlsx, .xls, .csv"
      {...props}
    />
  );
};

export default FileUploader;