import axios from 'axios';
import { VITE_API_URL, VITE_API_TIMEOUT } from '../config/environment';

// ============================================
// CONFIGURACIÓN BASE DE AXIOS
// ============================================

const apiClient = axios.create({
  baseURL: VITE_API_URL,
  timeout: VITE_API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// ============================================
// INTERCEPTORES
// ============================================

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Agregar timestamp para evitar caché
    config.params = {
      ...config.params,
      _t: Date.now()
    };

    // Log en desarrollo
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log(`🚀 [${config.method.toUpperCase()}] ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log en desarrollo
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log(`✅ [${response.status}] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Log en desarrollo
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.error('❌ Error en response:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
    }

    // Construir mensaje de error amigable
    let mensaje = 'Error en la solicitud';
    
    if (error.response) {
      // El servidor respondió con error
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          mensaje = data?.error || 'Solicitud incorrecta';
          break;
        case 404:
          mensaje = 'Recurso no encontrado';
          break;
        case 422:
          mensaje = data?.error || 'Error de validación';
          break;
        case 500:
          mensaje = 'Error interno del servidor';
          break;
        default:
          mensaje = data?.error || `Error ${status}`;
      }
    } else if (error.request) {
      // No hubo respuesta
      mensaje = 'No se pudo conectar con el servidor';
    } else {
      // Error en la configuración
      mensaje = error.message || 'Error desconocido';
    }

    return Promise.reject({
      ...error,
      mensajeUsuario: mensaje
    });
  }
);

// ============================================
// MÉTODOS HTTP
// ============================================

export const get = (url, params = {}, config = {}) => {
  return apiClient.get(url, { params, ...config });
};

export const post = (url, data = {}, config = {}) => {
  return apiClient.post(url, data, config);
};

export const put = (url, data = {}, config = {}) => {
  return apiClient.put(url, data, config);
};

export const patch = (url, data = {}, config = {}) => {
  return apiClient.patch(url, data, config);
};

export const del = (url, config = {}) => {
  return apiClient.delete(url, config);
};

// ============================================
// MÉTODOS PARA ARCHIVOS
// ============================================

export const uploadFile = (url, formData, onProgress = null) => {
  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onProgress
      ? (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      : undefined
  });
};

export const downloadFile = (url, params = {}, fileName = null) => {
  return apiClient.get(url, {
    params,
    responseType: 'blob'
  }).then(response => {
    const contentDisposition = response.headers['content-disposition'];
    let filename = fileName;
    
    if (!filename && contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, '');
      }
    }

    if (!filename) {
      filename = `download-${Date.now()}.xlsx`;
    }

    // Crear URL y descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response;
  });
};

// ============================================
// EXPORTACIONES
// ============================================
export default {
  get,
  post,
  put,
  patch,
  delete: del,
  uploadFile,
  downloadFile,
  instance: apiClient
};