// src/config/environment.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde el archivo .env en la raíz
dotenv.config({ path: resolve(__dirname, '../../.env') });

// Validar que las variables requeridas existan
const requiredEnvVars = [
  'DB_SERVER',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Variable de entorno requerida: ${envVar} no está definida`);
    process.exit(1);
  }
});

// Exportar configuración validada
export const env = {
  // Servidor
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  
  // Base de datos
  DB: {
    SERVER: process.env.DB_SERVER,
    PORT: parseInt(process.env.DB_PORT) || 1433,
    NAME: process.env.DB_NAME,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    ENCRYPT: process.env.DB_ENCRYPT === 'true',
    TRUST_SERVER_CERTIFICATE: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    CONNECTION_TIMEOUT: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
    POOL_MAX: parseInt(process.env.DB_POOL_MAX) || 10,
    POOL_MIN: parseInt(process.env.DB_POOL_MIN) || 0,
    POOL_IDLE: parseInt(process.env.DB_POOL_IDLE) || 10000
  },
  
  // JWT
  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // Archivos
  UPLOAD: {
    DIR: process.env.UPLOAD_DIR || './uploads',
    MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
    ALLOWED_EXTENSIONS: process.env.ALLOWED_EXTENSIONS?.split(',') || ['.xlsx', '.xls', '.csv'],
    TEMP_RETENTION_HOURS: parseInt(process.env.TEMP_FILE_RETENTION_HOURS) || 24
  },
  
  // Logs
  LOG: {
    LEVEL: process.env.LOG_LEVEL || 'debug',
    DIR: process.env.LOG_DIR || './logs'
  },
  
  // CORS
  CORS: {
    ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    CREDENTIALS: process.env.CORS_CREDENTIALS === 'true'
  },
  
  // Tareas programadas
  CRON: {
    ENABLED: process.env.ENABLE_CRON_JOBS === 'true',
    CALCULO_HORA: process.env.CALCULO_AUTOMATICO_HORA || '02:00',
    LIMPIEZA_HORA: process.env.LIMPIEZA_TEMP_HORA || '03:00'
  },
  
  // Seguridad
  SECURITY: {
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    SESSION_SECRET: process.env.SESSION_SECRET || 'default_session_secret',
    RATE_LIMIT: {
      WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
      MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    }
  }
};

// Función para verificar si estamos en desarrollo
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

export default env;