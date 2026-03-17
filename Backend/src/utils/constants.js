// src/config/constants.js

// ============================================
// CONSTANTES DE LA APLICACIÓN
// ============================================

/**
 * Códigos de respuesta HTTP
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Tipos de jornada laboral
 */
export const TIPOS_JORNADA = {
  DIURNA: 'DIURNA',
  NOCTURNA: 'NOCTURNA',
  MIXTA: 'MIXTA'
};

/**
 * Días de la semana
 */
export const DIAS_SEMANA = {
  0: 'DOMINGO',
  1: 'LUNES',
  2: 'MARTES',
  3: 'MIÉRCOLES',
  4: 'JUEVES',
  5: 'VIERNES',
  6: 'SÁBADO'
};

/**
 * Tipos de horas extras (según Código de Trabajo RD)
 */
export const TIPOS_HORAS_EXTRAS = {
  DIURNA: {
    codigo: '35%',
    descripcion: 'Horas Extras Diurnas',
    porcentaje: 35,
    factor: 1.35,
    color: '#3B82F6'
  },
  FIN_SEMANA: {
    codigo: '100%',
    descripcion: 'Horas Extras Fin de Semana',
    porcentaje: 100,
    factor: 2.0,
    color: '#10B981'
  },
  NOCTURNA: {
    codigo: '15%',
    descripcion: 'Horas Extras Nocturnas',
    porcentaje: 15,
    factor: 1.15,
    color: '#F59E0B'
  },
  FERIADO: {
    codigo: 'FERIADO',
    descripcion: 'Días Feriados',
    porcentaje: 100,
    factor: 2.0,
    color: '#EF4444'
  }
};

/**
 * Tipos de registro de asistencia
 */
export const TIPOS_REGISTRO = {
  IMPORTADO: 'IMPORTADO',
  MANUAL: 'MANUAL',
  RELOJ: 'RELOJ'
};

/**
 * Orígenes de datos
 */
export const ORIGENES_DATOS = {
  EXCEL: 'EXCEL',
  MANUAL: 'MANUAL',
  API: 'API',
  RELOJ_BIOMETRICO: 'RELOJ_BIOMETRICO'
};

/**
 * Estados de importación
 */
export const ESTADOS_IMPORTACION = {
  PENDIENTE: 'PENDIENTE',
  PROCESANDO: 'PROCESANDO',
  PROCESADO: 'PROCESADO',
  ERROR: 'ERROR',
  PARCIAL: 'PARCIAL'
};

/**
 * Números de quincena
 */
export const QUINCENAS = {
  PRIMERA: 1,
  SEGUNDA: 2
};

/**
 * Límites legales (Código de Trabajo RD)
 */
export const LIMITES_LEGALES = {
  HORAS_EXTRAS_MAX_TRIMESTRE: 68,  // Artículo 204
  JORNADA_DIURNA_HORAS: 8,
  JORNADA_NOCTURNA_HORAS: 7,
  JORNADA_MIXTA_HORAS: 8,
  DIAS_LABORALES_MENSUALES: 23.83,  // Para cálculo de salario diario
  HORAS_LABORALES_MENSUALES: 190.64  // 23.83 * 8
};

/**
 * Horarios por defecto
 */
export const HORARIOS_DEFAULT = {
  SEMANA: {
    entrada: '08:30',
    salida: '17:30',
    horasBase: 9
  },
  SABADO: {
    entrada: '09:00',
    salida: '13:00',
    horasBase: 4
  },
  NOCTURNO: {
    inicio: '21:00',
    fin: '07:00'
  }
};

/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
  EMPLEADO_NO_ENCONTRADO: 'Empleado no encontrado',
  EMPLEADO_CODIGO_DUPLICADO: 'Ya existe un empleado con este código',
  REGISTRO_NO_ENCONTRADO: 'Registro no encontrado',
  IMPORTACION_NO_ENCONTRADA: 'Importación no encontrada',
  FECHA_INVALIDA: 'Fecha inválida',
  HORA_INVALIDA: 'Hora inválida',
  ARCHIVO_NO_VALIDO: 'El archivo no es válido',
  ARCHIVO_DEMASIADO_GRANDE: 'El archivo excede el tamaño máximo permitido',
  EXTENSION_NO_PERMITIDA: 'Extensión de archivo no permitida',
  SIN_REGISTROS_PARA_PROCESAR: 'No hay registros para procesar',
  ERROR_INTERNO: 'Error interno del servidor',
  ACCESO_DENEGADO: 'Acceso denegado',
  TOKEN_INVALIDO: 'Token inválido o expirado',
  CAMPOS_REQUERIDOS: 'Campos requeridos incompletos'
};

/**
 * Mensajes de éxito
 */
export const SUCCESS_MESSAGES = {
  EMPLEADO_CREADO: 'Empleado creado correctamente',
  EMPLEADO_ACTUALIZADO: 'Empleado actualizado correctamente',
  EMPLEADO_ELIMINADO: 'Empleado eliminado correctamente',
  IMPORTACION_EXITOSA: 'Archivo importado correctamente',
  REGISTRO_CREADO: 'Registro creado correctamente',
  CALCULO_EXITOSO: 'Cálculo realizado correctamente',
  REPORTE_GENERADO: 'Reporte generado correctamente'
};

/**
 * Roles de usuario
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  OPERADOR: 'OPERADOR',
  CONSULTA: 'CONSULTA'
};

/**
 * Permisos por rol
 */
export const PERMISOS = {
  [ROLES.ADMIN]: {
    empleados: ['crear', 'leer', 'actualizar', 'eliminar'],
    importacion: ['crear', 'leer', 'procesar'],
    registros: ['crear', 'leer', 'actualizar', 'eliminar'],
    calculos: ['ejecutar', 'leer'],
    reportes: ['generar', 'exportar'],
    configuracion: ['leer', 'actualizar']
  },
  [ROLES.SUPERVISOR]: {
    empleados: ['leer'],
    importacion: ['crear', 'leer', 'procesar'],
    registros: ['crear', 'leer'],
    calculos: ['ejecutar', 'leer'],
    reportes: ['generar', 'exportar'],
    configuracion: ['leer']
  },
  [ROLES.OPERADOR]: {
    empleados: ['leer'],
    importacion: ['crear', 'leer'],
    registros: ['crear', 'leer'],
    calculos: ['leer'],
    reportes: ['leer'],
    configuracion: []
  },
  [ROLES.CONSULTA]: {
    empleados: ['leer'],
    importacion: ['leer'],
    registros: ['leer'],
    calculos: ['leer'],
    reportes: ['leer'],
    configuracion: []
  }
};

/**
 * Feriados de República Dominicana
 */
export const FERIADOS_RD = [
  { nombre: 'Año Nuevo', dia: 1, mes: 1, fijo: true },
  { nombre: 'Día de Reyes', dia: 6, mes: 1, fijo: true },
  { nombre: 'Día de la Altagracia', dia: 21, mes: 1, fijo: true },
  { nombre: 'Día de Duarte', dia: 26, mes: 1, fijo: true },
  { nombre: 'Día de la Independencia', dia: 27, mes: 2, fijo: true },
  { nombre: 'Día del Trabajo', dia: 1, mes: 5, fijo: false },
  { nombre: 'Corpus Christi', dia: 30, mes: 5, fijo: false },
  { nombre: 'Día de la Restauración', dia: 16, mes: 8, fijo: true },
  { nombre: 'Día de las Mercedes', dia: 24, mes: 9, fijo: true },
  { nombre: 'Día de la Constitución', dia: 6, mes: 11, fijo: true },
  { nombre: 'Navidad', dia: 25, mes: 12, fijo: true }
];

/**
 * Regex útiles
 */
export const REGEX = {
  HORA: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
  FECHA: /^\d{4}-\d{2}-\d{2}$/,
  CODIGO_EMPLEADO: /^[A-Z0-9-]+$/,
  TELEFONO_RD: /^\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}$/,
  CEDULA_RD: /^\d{3}-\d{7}-\d{1}$/
};

export default {
  HTTP_STATUS,
  TIPOS_JORNADA,
  DIAS_SEMANA,
  TIPOS_HORAS_EXTRAS,
  TIPOS_REGISTRO,
  ORIGENES_DATOS,
  ESTADOS_IMPORTACION,
  QUINCENAS,
  LIMITES_LEGALES,
  HORARIOS_DEFAULT,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROLES,
  PERMISOS,
  FERIADOS_RD,
  REGEX
};