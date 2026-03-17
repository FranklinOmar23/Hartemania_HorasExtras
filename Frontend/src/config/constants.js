// ============================================
// CONSTANTES GLOBALES DE CONFIGURACIÓN
// ============================================

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Hartemania Overtime',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  COMPANY: import.meta.env.VITE_COMPANY_NAME || 'Hartemania',
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'light',
  ITEMS_PER_PAGE: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 20,
  DATE_FORMAT: import.meta.env.VITE_DATE_FORMAT || 'DD/MM/YYYY',
  TIME_FORMAT: import.meta.env.VITE_TIME_FORMAT || 'HH:mm',
  DATETIME_FORMAT: import.meta.env.VITE_DATETIME_FORMAT || 'DD/MM/YYYY HH:mm',
  CURRENCY: import.meta.env.VITE_CURRENCY || 'RD$',
  CURRENCY_SYMBOL: import.meta.env.VITE_CURRENCY_SYMBOL || 'RD$'
};

// ============================================
// RUTAS DE LA API
// ============================================
export const API_ENDPOINTS = {
  // Empleados
  EMPLEADOS: '/empleados',
  EMPLEADOS_BUSCAR: '/empleados/buscar',
  EMPLEADOS_ACTIVOS: '/empleados/activos',
  EMPLEADOS_INACTIVOS: '/empleados/inactivos',
  
  // Registros
  REGISTROS: '/registros',
  REGISTROS_MANUAL: '/registros/manual',
  REGISTROS_IMPORTAR: '/registros/importar',
  REGISTROS_PENDIENTES: '/registros/pendientes',
  
  // Importaciones
  IMPORTACIONES: '/importacion',
  IMPORTACIONES_PROCESAR: '/importacion/procesar',
  IMPORTACIONES_VALIDAR: '/importacion/validar',
  
  // Cálculos
  CALCULOS: '/calculos',
  CALCULOS_QUINCENA: '/calculos/quincena',
  CALCULOS_EMPLEADO: '/calculos/empleado',
  
  // Reportes
  REPORTES: '/reportes',
  REPORTES_QUINCENAL: '/reportes/quincenal',
  REPORTES_EMPLEADO: '/reportes/empleado',
  REPORTES_EXPORTAR: '/reportes/exportar',
  
  // Configuración
  CONFIGURACION: '/configuracion',
  JORNADAS: '/configuracion/jornadas',
  FERIADOS: '/configuracion/feriados',
  TIPOS_HE: '/configuracion/tipos-he'
};

// ============================================
// RUTAS DEL FRONTEND
// ============================================
export const ROUTES = {
  // Dashboard
  DASHBOARD: '/',
  
  // Empleados
  EMPLEADOS: '/empleados',
  EMPLEADOS_NUEVO: '/empleados/nuevo',
  EMPLEADOS_EDITAR: (id) => `/empleados/editar/${id}`,
  EMPLEADOS_DETALLE: (id) => `/empleados/${id}`,
  
  // Importación
  IMPORTACION: '/importacion',
  IMPORTACION_DETALLE: (id) => `/importacion/${id}`,
  
  // Registros
  REGISTROS: '/registros',
  REGISTROS_MANUAL: '/registros/manual',
  
  // Cálculos
  CALCULOS: '/calculos',
  CALCULOS_DETALLE: (id) => `/calculos/${id}`,
  
  // Reportes
  REPORTES: '/reportes',
  
  // Configuración
  CONFIGURACION: '/configuracion',
  CONFIGURACION_JORNADAS: '/configuracion/jornadas',
  CONFIGURACION_FERIADOS: '/configuracion/feriados',
  CONFIGURACION_TIPOS_HE: '/configuracion/tipos-he'
};

// ============================================
// TIPOS DE HORAS EXTRAS
// ============================================
export const TIPOS_HORAS_EXTRAS = {
  DIURNA: {
    id: 1,
    codigo: '35%',
    nombre: 'Horas Extras Diurnas',
    descripcion: 'Aplica de lunes a viernes después de la jornada regular',
    porcentaje: 35,
    factor: 1.35,
    color: '#3B82F6',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200'
  },
  FIN_SEMANA: {
    id: 2,
    codigo: '100%',
    nombre: 'Horas Extras Fin de Semana',
    descripcion: 'Aplica sábados, domingos y días feriados',
    porcentaje: 100,
    factor: 2.0,
    color: '#10B981',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  },
  NOCTURNA: {
    id: 3,
    codigo: '15%',
    nombre: 'Horas Extras Nocturnas',
    descripcion: 'Aplica después de las 9:00 PM',
    porcentaje: 15,
    factor: 1.15,
    color: '#F59E0B',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  FERIADO: {
    id: 4,
    codigo: 'FERIADO',
    nombre: 'Días Feriados',
    descripcion: 'Aplica en días feriados según calendario oficial',
    porcentaje: 100,
    factor: 2.0,
    color: '#EF4444',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  }
};

// ============================================
// DÍAS DE LA SEMANA
// ============================================
export const DIAS_SEMANA = [
  { id: 0, nombre: 'Domingo', nombreCorto: 'Dom', nombreIngles: 'Sunday' },
  { id: 1, nombre: 'Lunes', nombreCorto: 'Lun', nombreIngles: 'Monday' },
  { id: 2, nombre: 'Martes', nombreCorto: 'Mar', nombreIngles: 'Tuesday' },
  { id: 3, nombre: 'Miércoles', nombreCorto: 'Mié', nombreIngles: 'Wednesday' },
  { id: 4, nombre: 'Jueves', nombreCorto: 'Jue', nombreIngles: 'Thursday' },
  { id: 5, nombre: 'Viernes', nombreCorto: 'Vie', nombreIngles: 'Friday' },
  { id: 6, nombre: 'Sábado', nombreCorto: 'Sáb', nombreIngles: 'Saturday' }
];

// ============================================
// MESES DEL AÑO
// ============================================
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

// ============================================
// ESTADOS DE IMPORTACIÓN
// ============================================
export const ESTADOS_IMPORTACION = {
  PENDIENTE: {
    id: 'PENDIENTE',
    nombre: 'Pendiente',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icono: '⏳'
  },
  PROCESADO: {
    id: 'PROCESADO',
    nombre: 'Procesado',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icono: '✅'
  },
  ERROR: {
    id: 'ERROR',
    nombre: 'Error',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icono: '❌'
  }
};

// ============================================
// TIPOS DE REGISTRO
// ============================================
export const TIPOS_REGISTRO = {
  IMPORTADO: {
    id: 'IMPORTADO',
    nombre: 'Importado',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icono: '📤'
  },
  MANUAL: {
    id: 'MANUAL',
    nombre: 'Manual',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icono: '✏️'
  },
  RELOJ: {
    id: 'RELOJ',
    nombre: 'Reloj Biométrico',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icono: '🕐'
  }
};

// ============================================
// LÍMITES LEGALES (Código de Trabajo RD)
// ============================================
export const LIMITES_LEGALES = {
  HORAS_EXTRAS_MAX_TRIMESTRE: 68,
  HORAS_EXTRAS_MAX_SEMANA: 23,
  JORNADA_DIURNA_HORAS: 8,
  JORNADA_NOCTURNA_HORAS: 7,
  JORNADA_MIXTA_HORAS: 8,
  DIAS_LABORALES_MES: 23.83,
  HORAS_LABORALES_MES: 190.64, // 23.83 * 8
  HORAS_NOCTURNAS_INICIO: '21:00',
  HORAS_NOCTURNAS_FIN: '07:00'
};

// ============================================
// MENSAJES DEL SISTEMA
// ============================================
export const MENSAJES = {
  // Éxito
  EXITO: {
    GUARDADO: 'Datos guardados correctamente',
    ELIMINADO: 'Registro eliminado correctamente',
    ACTUALIZADO: 'Registro actualizado correctamente',
    IMPORTADO: 'Archivo importado correctamente',
    CALCULADO: 'Cálculo realizado correctamente',
    EXPORTADO: 'Archivo exportado correctamente'
  },
  
  // Error
  ERROR: {
    GENERAL: 'Ha ocurrido un error',
    CARGA: 'Error al cargar los datos',
    GUARDADO: 'Error al guardar los datos',
    ELIMINADO: 'Error al eliminar el registro',
    IMPORTACION: 'Error al importar el archivo',
    CALCULO: 'Error al realizar el cálculo',
    EXPORTACION: 'Error al exportar el archivo',
    CONEXION: 'Error de conexión con el servidor',
    VALIDACION: 'Error de validación'
  },
  
  // Advertencia
  ADVERTENCIA: {
    SIN_DATOS: 'No hay datos para mostrar',
    SELECCIONAR: 'Debe seleccionar al menos un elemento',
    LIMITE_EXCEDIDO: 'Ha excedido el límite legal de horas extras',
    REGISTRO_DUPLICADO: 'Ya existe un registro para esta fecha'
  },
  
  // Confirmación
  CONFIRMACION: {
    ELIMINAR: '¿Está seguro que desea eliminar este registro?',
    ELIMINAR_MULTIPLE: '¿Está seguro que desea eliminar los registros seleccionados?',
    CALCULAR: '¿Desea realizar el cálculo para este período?',
    IMPORTAR: '¿Confirma la importación de este archivo?'
  }
};

// ============================================
// CONFIGURACIÓN DE ARCHIVOS
// ============================================
export const FILE_CONFIG = {
  MAX_SIZE: parseInt(import.meta.env.VITE_MAX_UPLOAD_SIZE) * 1024 * 1024 || 10 * 1024 * 1024,
  ALLOWED_TYPES: ['.xlsx', '.xls', '.csv'],
  ALLOWED_MIME_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ]
};

// ============================================
// CONFIGURACIÓN DE PAGINACIÓN
// ============================================
export const PAGINACION = {
  ITEMS_POR_PAGINA: [10, 20, 30, 50, 100],
  ITEMS_POR_PAGINA_DEFAULT: 20,
  MAX_BOTONES_VISIBLES: 5
};