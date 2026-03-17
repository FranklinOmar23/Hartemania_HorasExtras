// ============================================
// FUNCIONES DE FORMATEO
// ============================================

/**
 * Formatea un número como moneda (RD$)
 * @param {number} valor - Valor a formatear
 * @param {boolean} conDecimales - Incluir decimales
 * @returns {string} Valor formateado
 */
export const formatearMoneda = (valor, conDecimales = true) => {
  if (valor === null || valor === undefined) return 'RD$ 0.00';
  
  const opciones = {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: conDecimales ? 2 : 0,
    maximumFractionDigits: conDecimales ? 2 : 0
  };
  
  return new Intl.NumberFormat('es-DO', opciones).format(valor);
};

/**
 * Formatea un número con separadores de miles
 * @param {number} valor - Valor a formatear
 * @param {number} decimales - Número de decimales
 * @returns {string} Número formateado
 */
export const formatearNumero = (valor, decimales = 2) => {
  if (valor === null || valor === undefined) return '0';
  
  return new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(valor);
};

/**
 * Formatea horas en formato HH:mm
 * @param {number} horasDecimal - Horas en formato decimal (ej: 8.5)
 * @returns {string} Horas formateadas (ej: 08:30)
 */
export const formatearHoras = (horasDecimal) => {
  if (horasDecimal === null || horasDecimal === undefined) return '00:00';
  
  const horas = Math.floor(horasDecimal);
  const minutos = Math.round((horasDecimal - horas) * 60);
  
  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
};

/**
 * Formatea horas y minutos a decimal
 * @param {string} horas - Formato 'HH:mm'
 * @returns {number} Horas en decimal
 */
export const formatearHorasADecimal = (horas) => {
  if (!horas) return 0;
  
  const [h, m] = horas.split(':').map(Number);
  return h + (m / 60);
};

/**
 * Formatea un porcentaje
 * @param {number} valor - Valor del porcentaje
 * @param {number} decimales - Número de decimales
 * @returns {string} Porcentaje formateado
 */
export const formatearPorcentaje = (valor, decimales = 2) => {
  if (valor === null || valor === undefined) return '0%';
  
  return new Intl.NumberFormat('es-DO', {
    style: 'percent',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(valor / 100);
};

/**
 * Formatea un teléfono dominicano
 * @param {string} telefono - Teléfono a formatear
 * @returns {string} Teléfono formateado (809-555-5555)
 */
export const formatearTelefono = (telefono) => {
  if (!telefono) return '';
  
  // Eliminar caracteres no numéricos
  const numeros = telefono.replace(/\D/g, '');
  
  if (numeros.length === 10) {
    return `${numeros.slice(0, 3)}-${numeros.slice(3, 6)}-${numeros.slice(6)}`;
  } else if (numeros.length === 7) {
    return `${numeros.slice(0, 3)}-${numeros.slice(3)}`;
  }
  
  return telefono;
};

/**
 * Formatea un número de cédula dominicana
 * @param {string} cedula - Cédula a formatear
 * @returns {string} Cédula formateada (001-1234567-8)
 */
export const formatearCedula = (cedula) => {
  if (!cedula) return '';
  
  const numeros = cedula.replace(/\D/g, '');
  
  if (numeros.length === 11) {
    return `${numeros.slice(0, 3)}-${numeros.slice(3, 10)}-${numeros.slice(10)}`;
  }
  
  return cedula;
};

/**
 * Formatea un número de RNC
 * @param {string} rnc - RNC a formatear
 * @returns {string} RNC formateado (1-23-45678-9)
 */
export const formatearRNC = (rnc) => {
  if (!rnc) return '';
  
  const numeros = rnc.replace(/\D/g, '');
  
  if (numeros.length === 9) {
    return `${numeros.slice(0, 1)}-${numeros.slice(1, 3)}-${numeros.slice(3, 8)}-${numeros.slice(8)}`;
  }
  
  return rnc;
};

/**
 * Formatea un texto a mayúsculas
 * @param {string} texto - Texto a formatear
 * @returns {string} Texto en mayúsculas
 */
export const formatearMayusculas = (texto) => {
  if (!texto) return '';
  return texto.toUpperCase();
};

/**
 * Formatea un texto a título (primera letra mayúscula)
 * @param {string} texto - Texto a formatear
 * @returns {string} Texto formateado
 */
export const formatearTitulo = (texto) => {
  if (!texto) return '';
  
  return texto.toLowerCase().split(' ').map(palabra => 
    palabra.charAt(0).toUpperCase() + palabra.slice(1)
  ).join(' ');
};

/**
 * Trunca un texto a una longitud máxima
 * @param {string} texto - Texto a truncar
 * @param {number} longitud - Longitud máxima
 * @param {string} sufijo - Sufijo a agregar (default: '...')
 * @returns {string} Texto truncado
 */
export const truncarTexto = (texto, longitud = 50, sufijo = '...') => {
  if (!texto) return '';
  if (texto.length <= longitud) return texto;
  
  return texto.substring(0, longitud) + sufijo;
};

/**
 * Formatea un número de tarjeta de crédito
 * @param {string} tarjeta - Número de tarjeta
 * @returns {string} Tarjeta formateada
 */
export const formatearTarjeta = (tarjeta) => {
  if (!tarjeta) return '';
  
  const numeros = tarjeta.replace(/\D/g, '');
  const grupos = numeros.match(/.{1,4}/g);
  
  return grupos ? grupos.join(' ') : tarjeta;
};

/**
 * Formatea bytes a unidad legible
 * @param {number} bytes - Bytes a formatear
 * @param {number} decimales - Decimales a mostrar
 * @returns {string} Tamaño formateado
 */
export const formatearBytes = (bytes, decimales = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimales)) + ' ' + sizes[i];
};

/**
 * Formatea un número de identificación fiscal (NCF)
 * @param {string} ncf - NCF a formatear
 * @returns {string} NCF formateado
 */
export const formatearNCF = (ncf) => {
  if (!ncf) return '';
  
  const partes = ncf.match(/.{1,3}/g);
  return partes ? partes.join('-') : ncf;
};

/**
 * Formatea un tiempo en segundos a formato legible
 * @param {number} segundos - Tiempo en segundos
 * @returns {string} Tiempo formateado (ej: 2h 30m)
 */
export const formatearTiempo = (segundos) => {
  if (!segundos || segundos < 0) return '0s';
  
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = segundos % 60;
  
  const partes = [];
  if (horas > 0) partes.push(`${horas}h`);
  if (minutos > 0) partes.push(`${minutos}m`);
  if (segs > 0 || partes.length === 0) partes.push(`${segs}s`);
  
  return partes.join(' ');
};