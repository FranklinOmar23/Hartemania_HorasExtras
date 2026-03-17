// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';
import { HTTP_STATUS } from '../utils/constants.js';
import { env } from '../config/environment.js';

/**
 * Limitador global de peticiones
 * Previene ataques de fuerza bruta y DoS
 */
export const globalLimiter = rateLimit({
  windowMs: env.SECURITY.RATE_LIMIT.WINDOW_MS, // 15 minutos por defecto
  max: env.SECURITY.RATE_LIMIT.MAX_REQUESTS, // 100 peticiones por ventana
  message: {
    success: false,
    error: 'Demasiadas peticiones, por favor intente más tarde',
    retryAfter: Math.ceil(env.SECURITY.RATE_LIMIT.WINDOW_MS / 1000 / 60) // minutos
  },
  standardHeaders: true, // Devuelve info en headers `RateLimit-*`
  legacyHeaders: false, // Desactiva headers `X-RateLimit-*`
  skipSuccessfulRequests: false, // Cuenta todas las peticiones
  keyGenerator: (req) => {
    // Usar IP como clave, o token si está autenticado
    return req.ip;
  },
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'Límite de peticiones excedido',
      retryAfter: Math.ceil(env.SECURITY.RATE_LIMIT.WINDOW_MS / 1000)
    });
  }
});

/**
 * Limitador específico para importación de archivos
 * Límites más estrictos porque es operación pesada
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 importaciones por hora
  message: {
    success: false,
    error: 'Ha excedido el límite de importaciones, intente más tarde'
  },
  keyGenerator: (req) => req.ip
});

/**
 * Limitador para cálculos de nómina
 */
export const calculoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 cálculos por hora
  message: {
    success: false,
    error: 'Límite de cálculos excedido'
  }
});

/**
 * Limitador para reportes
 */
export const reporteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 30, // 30 reportes por hora
  message: {
    success: false,
    error: 'Límite de reportes excedido'
  }
});

/**
 * Limitador para APIs públicas (búsquedas)
 */
export const busquedaLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // 60 búsquedas por minuto
  message: {
    success: false,
    error: 'Demasiadas búsquedas, espere un momento'
  }
});

export default {
  globalLimiter,
  uploadLimiter,
  calculoLimiter,
  reporteLimiter,
  busquedaLimiter
};