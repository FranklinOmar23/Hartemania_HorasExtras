// ============================================
// CONSTANTES GLOBALES DE LA APLICACIÓN
// ============================================

// Rutas de la API
export const API_ROUTES = {
  EMPLEADOS: '/empleados',
  REGISTROS: '/registros',
  IMPORTACION: '/importacion',
  CALCULOS: '/calculos',
  REPORTES: '/reportes',
  CONFIGURACION: '/configuracion',
  FERIADOS: '/feriados',
  JORNADAS: '/jornadas',
  TIPOS_HE: '/tipos-he'
};

// Rutas del frontend
export const APP_ROUTES = {
  DASHBOARD: '/',
  EMPLEADOS: '/empleados',
  EMPLEADO_NUEVO: '/empleados/nuevo',
  EMPLEADO_EDITAR: '/empleados/editar/:id',
  EMPLEADO_DETALLE: '/empleados/:id',
  IMPORTACION: '/importacion',
  IMPORTACION_DETALLE: '/importacion/:id',
  REGISTROS: '/registros',
  REGISTRO_MANUAL: '/registros/manual',
  CALCULOS: '/calculos',
  CALCULO_DETALLE: '/calculos/:id',
  REPORTES: '/reportes',
  CONFIGURACION: '/configuracion',
  JORNADAS: '/configuracion/jornadas',
  FERIADOS: '/configuracion/feriados',
  TIPOS_HE: '/configuracion/tipos-he'
};

// Tipos de horas extras (según código de trabajo RD)
export const TIPOS_HORAS_EXTRAS = {
  DIURNA: {
    codigo: '35%',
    descripcion: 'Horas Extras Diurnas',
    porcentaje: 35,
    factor: 1.35,
    color: '#3B82F6',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  },
  FIN_SEMANA: {
    codigo: '100%',
    descripcion: 'Horas Extras Fin de Semana',
    porcentaje: 100,
    factor: 2.0,
    color: '#10B981',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  NOCTURNA: {
    codigo: '15%',
    descripcion: 'Horas Extras Nocturnas',
    porcentaje: 15,
    factor: 1.15,
    color: '#F59E0B',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  FERIADO: {
    codigo: 'FERIADO',
    descripcion: 'Días Feriados',
    porcentaje: 100,
    factor: 2.0,
    color: '#EF4444',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  }
};

// Días de la semana
export const DIAS_SEMANA = [
  { id: 0, nombre: 'Domingo', nombreCorto: 'Dom' },
  { id: 1, nombre: 'Lunes', nombreCorto: 'Lun' },
  { id: 2, nombre: 'Martes', nombreCorto: 'Mar' },
  { id: 3, nombre: 'Miércoles', nombreCorto: 'Mié' },
  { id: 4, nombre: 'Jueves', nombreCorto: 'Jue' },
  { id: 5, nombre: 'Viernes', nombreCorto: 'Vie' },
  { id: 6, nombre: 'Sábado', nombreCorto: 'Sáb' }
];

// Meses del año
export const MESES = [
  { id: 1, nombre: 'Enero', nombreCorto: 'Ene' },
  { id: 2, nombre: 'Febrero', nombreCorto: 'Feb' },
  { id: 3, nombre: 'Marzo', nombreCorto: 'Mar' },
  { id: 4, nombre: 'Abril', nombreCorto: 'Abr' },
  { id: 5, nombre: 'Mayo', nombreCorto: 'May' },
  { id: 6, nombre: 'Junio', nombreCorto: 'Jun' },
  { id: 7, nombre: 'Julio', nombreCorto: 'Jul' },
  { id: 8, nombre: 'Agosto', nombreCorto: 'Ago' },
  { id: 9, nombre: 'Septiembre', nombreCorto: 'Sep' },
  { id: 10, nombre: 'Octubre', nombreCorto: 'Oct' },
  { id: 11, nombre: 'Noviembre', nombreCorto: 'Nov' },
  { id: 12, nombre: 'Diciembre', nombreCorto: 'Dic' }
];

// Estados de importación
export const ESTADOS_IMPORTACION = {
  PENDIENTE: { id: 'PENDIENTE', nombre: 'Pendiente', color: 'yellow' },
  PROCESADO: { id: 'PROCESADO', nombre: 'Procesado', color: 'green' },
  ERROR: { id: 'ERROR', nombre: 'Error', color: 'red' }
};

// Tipos de registro
export const TIPOS_REGISTRO = {
  IMPORTADO: 'IMPORTADO',
  MANUAL: 'MANUAL',
  RELOJ: 'RELOJ'
};

// Límites legales (Código de Trabajo RD)
export const LIMITES_LEGALES = {
  HORAS_EXTRAS_MAX_TRIMESTRE: 68,  // Máximo 68 horas por trimestre
  JORNADA_DIURNA_HORAS: 8,
  JORNADA_NOCTURNA_HORAS: 7,
  JORNADA_MIXTA_HORAS: 8,
  DIAS_LABORALES_MES: 23.83,
  HORAS_LABORALES_MES: 190.64 // 23.83 * 8
};

// Mensajes del sistema
export const MENSAJES = {
  // Éxito
  GUARDADO_EXITO: 'Datos guardados correctamente',
  ELIMINADO_EXITO: 'Registro eliminado correctamente',
  IMPORTADO_EXITO: 'Archivo importado correctamente',
  CALCULADO_EXITO: 'Cálculo realizado correctamente',
  
  // Error
  ERROR_GENERAL: 'Ha ocurrido un error',
  ERROR_CARGA: 'Error al cargar los datos',
  ERROR_GUARDADO: 'Error al guardar los datos',
  ERROR_ELIMINADO: 'Error al eliminar el registro',
  ERROR_IMPORTACION: 'Error al importar el archivo',
  
  // Validación
  CAMPO_REQUERIDO: 'Este campo es requerido',
  FORMATO_INVALIDO: 'Formato inválido',
  HORA_INVALIDA: 'Hora inválida',
  FECHA_INVALIDA: 'Fecha inválida',
  
  // Confirmación
  CONFIRMAR_ELIMINAR: '¿Está seguro que desea eliminar este registro?',
  CONFIRMAR_CALCULAR: '¿Desea realizar el cálculo para este período?'
};

// Configuración de la aplicación
export const APP_CONFIG = {
  ITEMS_PER_PAGE: 20,
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['.xlsx', '.xls', '.csv'],
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  CURRENCY: 'RD$',
  DECIMAL_SEPARATOR: '.',
  THOUSAND_SEPARATOR: ','
};

// Colores para badges y estados
export const COLORES = {
  primary: {
    bg: 'bg-blue-500',
    text: 'text-white',
    hover: 'hover:bg-blue-600'
  },
  success: {
    bg: 'bg-green-500',
    text: 'text-white',
    hover: 'hover:bg-green-600'
  },
  warning: {
    bg: 'bg-yellow-500',
    text: 'text-white',
    hover: 'hover:bg-yellow-600'
  },
  danger: {
    bg: 'bg-red-500',
    text: 'text-white',
    hover: 'hover:bg-red-600'
  },
  info: {
    bg: 'bg-indigo-500',
    text: 'text-white',
    hover: 'hover:bg-indigo-600'
  }
};