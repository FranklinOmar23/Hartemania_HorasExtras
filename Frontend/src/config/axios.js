import axios from 'axios';

// ============================================
// CONFIGURACIÓN DE AXIOS
// Cliente HTTP para comunicarse con el backend
// ============================================

// Obtener la URL base desde variables de entorno
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL,
  timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// ============================================
// INTERCEPTORES DE SOLICITUDES
// ============================================
apiClient.interceptors.request.use(
  (config) => {
    // Agregar timestamp para evitar caché
    config.params = {
      ...config.params,
      _t: Date.now()
    };

    // Log en desarrollo
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log(`📤 [${config.method.toUpperCase()}] ${config.baseURL}${config.url}`, {
        params: config.params,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTORES DE RESPUESTAS
// ============================================
apiClient.interceptors.response.use(
  (response) => {
    // Log en desarrollo
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log(`📥 [${response.status}] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Manejo centralizado de errores
    if (error.response) {
      // El servidor respondió con un código de error
      const { status, data } = error.response;
      
      console.error(`❌ Error ${status}:`, data);

      // Personalizar mensajes según el código HTTP
      switch (status) {
        case 400:
          error.mensajeUsuario = data.error || 'Solicitud incorrecta';
          break;
        case 401:
          error.mensajeUsuario = 'No autorizado';
          break;
        case 403:
          error.mensajeUsuario = 'Acceso prohibido';
          break;
        case 404:
          error.mensajeUsuario = 'Recurso no encontrado';
          break;
        case 422:
          error.mensajeUsuario = data.error || 'Error de validación';
          error.errores = data.errores || [];
          break;
        case 500:
          error.mensajeUsuario = 'Error interno del servidor';
          break;
        default:
          error.mensajeUsuario = data.error || 'Error en la solicitud';
      }
    } else if (error.request) {
      // La solicitud se hizo pero no hubo respuesta
      console.error('❌ Sin respuesta del servidor:', error.request);
      error.mensajeUsuario = 'No se pudo conectar con el servidor';
    } else {
      // Error al configurar la solicitud
      console.error('❌ Error de configuración:', error.message);
      error.mensajeUsuario = 'Error al realizar la solicitud';
    }

    return Promise.reject(error);
  }
);

// ============================================
// MÉTODOS HTTP CONVENIENTES
// ============================================

/**
 * GET request
 * @param {string} url - Endpoint
 * @param {Object} params - Parámetros de consulta
 * @param {Object} config - Configuración adicional
 */
export const get = (url, params = {}, config = {}) => {
  return apiClient.get(url, { params, ...config });
};

/**
 * POST request
 * @param {string} url - Endpoint
 * @param {Object} data - Datos a enviar
 * @param {Object} config - Configuración adicional
 */
export const post = (url, data = {}, config = {}) => {
  return apiClient.post(url, data, config);
};

/**
 * PUT request
 * @param {string} url - Endpoint
 * @param {Object} data - Datos a enviar
 * @param {Object} config - Configuración adicional
 */
export const put = (url, data = {}, config = {}) => {
  return apiClient.put(url, data, config);
};

/**
 * PATCH request
 * @param {string} url - Endpoint
 * @param {Object} data - Datos a enviar
 * @param {Object} config - Configuración adicional
 */
export const patch = (url, data = {}, config = {}) => {
  return apiClient.patch(url, data, config);
};

/**
 * DELETE request
 * @param {string} url - Endpoint
 * @param {Object} config - Configuración adicional
 */
export const del = (url, config = {}) => {
  return apiClient.delete(url, config);
};

/**
 * POST para subir archivos (multipart/form-data)
 * @param {string} url - Endpoint
 * @param {FormData} formData - Datos del formulario
 * @param {Function} onProgress - Callback de progreso
 */
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

/**
 * GET para descargar archivos
 * @param {string} url - Endpoint
 * @param {Object} params - Parámetros
 */
export const downloadFile = (url, params = {}) => {
  return apiClient.get(url, {
    params,
    responseType: 'blob'
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