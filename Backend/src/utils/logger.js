// src/utils/logger.js
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurar que el directorio de logs existe
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Formatos personalizados
const formats = {
  // Formato para consola (colorido)
  console: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
      return `${timestamp} [${level}]: ${message}${metaStr}`;
    })
  ),

  // Formato para archivos (JSON)
  file: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
};

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    // Archivo para todos los logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: formats.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Archivo solo para errores
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: formats.file,
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Agregar transporte de consola en desarrollo
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: formats.console
  }));
}

// Middleware para logging de peticiones HTTP
logger.httpLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Métodos de log con metadata
logger.debug = (message, meta = {}) => {
  logger.log('debug', message, meta);
};

logger.info = (message, meta = {}) => {
  logger.log('info', message, meta);
};

logger.warn = (message, meta = {}) => {
  logger.log('warn', message, meta);
};

logger.error = (message, meta = {}) => {
  logger.log('error', message, meta);
};

// Log de errores de base de datos
logger.dbError = (error, query = null) => {
  logger.error('Database Error', {
    message: error.message,
    code: error.code,
    number: error.number,
    query: query?.substring(0, 500),
    stack: error.stack
  });
};

// Log de operaciones de negocio
logger.business = (action, user, details = {}) => {
  logger.info('Business Operation', {
    action,
    user,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Log de rendimiento
logger.performance = (operation, duration, details = {}) => {
  logger.info('Performance', {
    operation,
    duration: `${duration}ms`,
    ...details
  });
};

// Función para crear un logger contextual (por módulo)
logger.createContextLogger = (context) => {
  return {
    debug: (message, meta = {}) => logger.debug(`[${context}] ${message}`, meta),
    info: (message, meta = {}) => logger.info(`[${context}] ${message}`, meta),
    warn: (message, meta = {}) => logger.warn(`[${context}] ${message}`, meta),
    error: (message, meta = {}) => logger.error(`[${context}] ${message}`, meta)
  };
};

export default logger;