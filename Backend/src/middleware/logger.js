// src/middleware/logger.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurar que el directorio de logs existe
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Formatear fecha para logs
const getTimestamp = () => {
  return new Date().toISOString();
};

// Niveles de log
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const currentLogLevel = LOG_LEVELS[env.LOG_LEVEL] || LOG_LEVELS.info;

/**
 * Logger para archivos y consola
 */
class Logger {
  constructor() {
    this.logFile = path.join(logDir, 'app.log');
    this.errorFile = path.join(logDir, 'error.log');
  }

  /**
   * Escribir en archivo
   */
  writeToFile(filePath, message) {
    const logMessage = `${getTimestamp()} - ${message}\n`;
    fs.appendFileSync(filePath, logMessage);
  }

  /**
   * Log de depuración
   */
  debug(message, data = null) {
    if (currentLogLevel <= LOG_LEVELS.debug) {
      const logData = data ? ` | Data: ${JSON.stringify(data)}` : '';
      const logMessage = `[DEBUG] ${message}${logData}`;
      console.log('\x1b[36m%s\x1b[0m', logMessage); // Cyan
      
      if (env.NODE_ENV === 'development') {
        this.writeToFile(this.logFile, logMessage);
      }
    }
  }

  /**
   * Log informativo
   */
  info(message, data = null) {
    if (currentLogLevel <= LOG_LEVELS.info) {
      const logData = data ? ` | Data: ${JSON.stringify(data)}` : '';
      const logMessage = `[INFO] ${message}${logData}`;
      console.log('\x1b[32m%s\x1b[0m', logMessage); // Green
      this.writeToFile(this.logFile, logMessage);
    }
  }

  /**
   * Log de advertencia
   */
  warn(message, data = null) {
    if (currentLogLevel <= LOG_LEVELS.warn) {
      const logData = data ? ` | Data: ${JSON.stringify(data)}` : '';
      const logMessage = `[WARN] ${message}${logData}`;
      console.log('\x1b[33m%s\x1b[0m', logMessage); // Yellow
      this.writeToFile(this.logFile, logMessage);
    }
  }

  /**
   * Log de error
   */
  error(message, error = null) {
    if (currentLogLevel <= LOG_LEVELS.error) {
      const errorDetails = error ? ` | Error: ${error.message} | Stack: ${error.stack}` : '';
      const logMessage = `[ERROR] ${message}${errorDetails}`;
      console.log('\x1b[31m%s\x1b[0m', logMessage); // Red
      this.writeToFile(this.errorFile, logMessage);
    }
  }

  /**
   * Log de petición HTTP
   */
  http(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const message = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;
      
      if (res.statusCode >= 400) {
        this.warn(message, { ip: req.ip, userAgent: req.get('user-agent') });
      } else {
        this.info(message, { ip: req.ip });
      }
    });
    
    next();
  }
}

// Instancia única
const logger = new Logger();

// Middleware para logging de peticiones
export const requestLogger = (req, res, next) => {
  logger.http(req, res, next);
};

// Exportar el logger para uso en toda la app
export default logger;