// src/middleware/errorHandler.js
import { HTTP_STATUS } from '../utils/constants.js';
import { env } from '../config/environment.js';

/**
 * Manejador global de errores
 * Captura todos los errores y los formatea para la respuesta
 */
const errorHandler = (err, req, res, next) => {
  // Log del error
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Determinar código de estado
  const statusCode = err.status || err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Preparar respuesta de error
  const errorResponse = {
    success: false,
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // En desarrollo, incluir stack trace
  if (env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details || null;
  }

  // Errores específicos de SQL Server
  if (err.number) {
    switch (err.number) {
      case 2627: // Unique constraint violation
        errorResponse.error = 'Registro duplicado';
        errorResponse.code = 'DUPLICATE_ENTRY';
        break;
      case 547: // Foreign key violation
        errorResponse.error = 'El registro está siendo usado en otra tabla';
        errorResponse.code = 'FOREIGN_KEY_VIOLATION';
        break;
      case 8152: // String truncation
        errorResponse.error = 'Datos demasiado largos para el campo';
        errorResponse.code = 'STRING_TRUNCATION';
        break;
    }
  }

  // Errores de validación de express-validator
  if (err.array && typeof err.array === 'function') {
    errorResponse.error = 'Error de validación';
    errorResponse.details = err.array();
    errorResponse.code = 'VALIDATION_ERROR';
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para rutas no encontradas (404)
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.status = HTTP_STATUS.NOT_FOUND;
  next(error);
};

/**
 * Middleware para capturar errores asíncronos
 * Envuelve funciones async para evitar try/catch repetitivos
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;