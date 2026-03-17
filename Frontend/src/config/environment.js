// ============================================
// VALIDACIÓN Y CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ============================================

/**
 * Esquema de validación de variables de entorno
 */
const ENV_SCHEMA = {
  // API
  VITE_API_URL: {
    required: true,
    type: 'string',
    default: 'http://localhost:3000/api/v1'
  },
  VITE_API_TIMEOUT: {
    required: false,
    type: 'number',
    default: 30000
  },

  // Aplicación
  VITE_APP_NAME: {
    required: false,
    type: 'string',
    default: 'Hartemania Overtime'
  },
  VITE_APP_VERSION: {
    required: false,
    type: 'string',
    default: '1.0.0'
  },
  VITE_COMPANY_NAME: {
    required: false,
    type: 'string',
    default: 'Hartemania'
  },

  // UI
  VITE_ENABLE_DARK_MODE: {
    required: false,
    type: 'boolean',
    default: true
  },
  VITE_ENABLE_NOTIFICATIONS: {
    required: false,
    type: 'boolean',
    default: true
  },
  VITE_DEFAULT_THEME: {
    required: false,
    type: 'string',
    default: 'light',
    options: ['light', 'dark', 'system']
  },
  VITE_ITEMS_PER_PAGE: {
    required: false,
    type: 'number',
    default: 20,
    min: 5,
    max: 100
  },

  // Formatos
  VITE_DATE_FORMAT: {
    required: false,
    type: 'string',
    default: 'DD/MM/YYYY'
  },
  VITE_TIME_FORMAT: {
    required: false,
    type: 'string',
    default: 'HH:mm'
  },
  VITE_DATETIME_FORMAT: {
    required: false,
    type: 'string',
    default: 'DD/MM/YYYY HH:mm'
  },
  VITE_CURRENCY: {
    required: false,
    type: 'string',
    default: 'RD$'
  },

  // Archivos
  VITE_MAX_UPLOAD_SIZE: {
    required: false,
    type: 'number',
    default: 10,
    min: 1,
    max: 50
  },
  VITE_ALLOWED_FILE_TYPES: {
    required: false,
    type: 'string',
    default: '.xlsx,.xls,.csv'
  },

  // Debug
  VITE_ENABLE_DEBUG: {
    required: false,
    type: 'boolean',
    default: false
  },
  VITE_LOG_LEVEL: {
    required: false,
    type: 'string',
    default: 'error',
    options: ['debug', 'info', 'warn', 'error']
  }
};

// ============================================
// VALIDACIÓN DE VARIABLES DE ENTORNO
// ============================================

/**
 * Valida el tipo de una variable
 */
const validateType = (value, type) => {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return !isNaN(Number(value));
    case 'boolean':
      return value === 'true' || value === 'false' || typeof value === 'boolean';
    default:
      return true;
  }
};

/**
 * Convierte el valor al tipo correcto
 */
const parseValue = (value, type) => {
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true' || value === true;
    default:
      return value;
  }
};

/**
 * Valida las opciones permitidas
 */
const validateOptions = (value, options) => {
  if (!options) return true;
  return options.includes(value);
};

/**
 * Valida valores mínimos y máximos
 */
const validateRange = (value, min, max) => {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

// ============================================
// PROCESAMIENTO DE VARIABLES DE ENTORNO
// ============================================

const environment = {};

// Procesar cada variable según el esquema
Object.entries(ENV_SCHEMA).forEach(([key, config]) => {
  let value = import.meta.env[key];
  
  // Si no existe y es requerida, mostrar advertencia
  if (value === undefined || value === '') {
    if (config.required) {
      console.warn(`⚠️ Variable de entorno requerida no encontrada: ${key}. Usando valor por defecto: ${config.default}`);
    }
    value = config.default;
  }

  // Validar tipo
  if (!validateType(value, config.type)) {
    console.error(`❌ Variable de entorno ${key} debe ser de tipo ${config.type}`);
    value = config.default;
  }

  // Convertir al tipo correcto
  const parsedValue = parseValue(value, config.type);

  // Validar opciones
  if (config.options && !validateOptions(parsedValue, config.options)) {
    console.error(`❌ Variable de entorno ${key} debe ser uno de: ${config.options.join(', ')}`);
    value = config.default;
  }

  // Validar rango
  if (config.type === 'number' && !validateRange(parsedValue, config.min, config.max)) {
    console.error(`❌ Variable de entorno ${key} debe estar entre ${config.min} y ${config.max}`);
    value = config.default;
  }

  environment[key] = parsedValue;
});

// ============================================
// CONFIGURACIONES DERIVADAS
// ============================================

// Procesar tipos de archivo permitidos
environment.VITE_ALLOWED_FILE_TYPES_ARRAY = environment.VITE_ALLOWED_FILE_TYPES
  .split(',')
  .map(type => type.trim());

// Tamaño máximo en bytes
environment.VITE_MAX_UPLOAD_SIZE_BYTES = environment.VITE_MAX_UPLOAD_SIZE * 1024 * 1024;

// Modo debug
environment.IS_DEVELOPMENT = import.meta.env.DEV;
environment.IS_PRODUCTION = import.meta.env.PROD;

// ============================================
// EXPORTACIONES
// ============================================

export const {
  VITE_API_URL,
  VITE_API_TIMEOUT,
  VITE_APP_NAME,
  VITE_APP_VERSION,
  VITE_COMPANY_NAME,
  VITE_ENABLE_DARK_MODE,
  VITE_ENABLE_NOTIFICATIONS,
  VITE_DEFAULT_THEME,
  VITE_ITEMS_PER_PAGE,
  VITE_DATE_FORMAT,
  VITE_TIME_FORMAT,
  VITE_DATETIME_FORMAT,
  VITE_CURRENCY,
  VITE_MAX_UPLOAD_SIZE,
  VITE_MAX_UPLOAD_SIZE_BYTES,
  VITE_ALLOWED_FILE_TYPES,
  VITE_ALLOWED_FILE_TYPES_ARRAY,
  VITE_ENABLE_DEBUG,
  VITE_LOG_LEVEL,
  IS_DEVELOPMENT,
  IS_PRODUCTION
} = environment;

// Exportación por defecto con todas las variables
export default environment;