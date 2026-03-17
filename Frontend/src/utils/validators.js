// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Valida que un campo no esté vacío
 * @param {any} valor - Valor a validar
 * @returns {boolean} True si es válido
 */
export const requerido = (valor) => {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === 'string') return valor.trim().length > 0;
  if (typeof valor === 'number') return true;
  if (Array.isArray(valor)) return valor.length > 0;
  if (typeof valor === 'object') return Object.keys(valor).length > 0;
  return true;
};

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const validarEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida una cédula dominicana
 * @param {string} cedula - Cédula a validar
 * @returns {boolean} True si es válida
 */
export const validarCedula = (cedula) => {
  if (!cedula) return false;
  
  // Limpiar cédula
  const cedulaLimpia = cedula.replace(/\D/g, '');
  
  // Debe tener 11 dígitos
  if (cedulaLimpia.length !== 11) return false;
  
  // Algoritmo de validación de cédula dominicana
  const digitos = cedulaLimpia.split('').map(Number);
  const digitoVerificador = digitos.pop();
  
  let suma = 0;
  for (let i = 0; i < digitos.length; i++) {
    if (i % 2 === 0) {
      let multiplicado = digitos[i] * 2;
      if (multiplicado > 9) multiplicado -= 9;
      suma += multiplicado;
    } else {
      suma += digitos[i];
    }
  }
  
  const digitoCalculado = (10 - (suma % 10)) % 10;
  
  return digitoCalculado === digitoVerificador;
};

/**
 * Valida un RNC
 * @param {string} rnc - RNC a validar
 * @returns {boolean} True si es válido
 */
export const validarRNC = (rnc) => {
  if (!rnc) return false;
  
  const rncLimpio = rnc.replace(/\D/g, '');
  
  if (rncLimpio.length !== 9) return false;
  
  // Algoritmo de validación de RNC (módulo 11)
  const digitos = rncLimpio.split('').map(Number);
  const digitoVerificador = digitos.pop();
  
  const pesos = [7, 9, 8, 6, 5, 4, 3, 2];
  let suma = 0;
  
  for (let i = 0; i < digitos.length; i++) {
    suma += digitos[i] * pesos[i];
  }
  
  const digitoCalculado = (10 - (suma % 10)) % 10;
  
  return digitoCalculado === digitoVerificador;
};

/**
 * Valida un teléfono dominicano
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} True si es válido
 */
export const validarTelefono = (telefono) => {
  if (!telefono) return false;
  
  const telefonoLimpio = telefono.replace(/\D/g, '');
  
  // Puede ser 10 dígitos (809-555-5555) o 7 dígitos (555-5555)
  return telefonoLimpio.length === 10 || telefonoLimpio.length === 7;
};

/**
 * Valida un número de Seguro Social
 * @param {string} nss - NSS a validar
 * @returns {boolean} True si es válido
 */
export const validarNSS = (nss) => {
  if (!nss) return false;
  
  const nssLimpio = nss.replace(/\D/g, '');
  
  // El NSS dominicano tiene 11 dígitos
  return nssLimpio.length === 11;
};

/**
 * Valida que un valor sea numérico
 * @param {any} valor - Valor a validar
 * @returns {boolean} True si es numérico
 */
export const esNumerico = (valor) => {
  if (valor === null || valor === undefined) return false;
  return !isNaN(parseFloat(valor)) && isFinite(valor);
};

/**
 * Valida que un número esté en un rango
 * @param {number} valor - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} True si está en rango
 */
export const rangoNumerico = (valor, min, max) => {
  if (!esNumerico(valor)) return false;
  const num = parseFloat(valor);
  return num >= min && num <= max;
};

/**
 * Valida una hora en formato HH:mm
 * @param {string} hora - Hora a validar
 * @returns {boolean} True si es válida
 */
export const validarHora = (hora) => {
  if (!hora) return false;
  
  // Formato HH:mm
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(hora);
};

/**
 * Valida que una hora sea menor que otra
 * @param {string} horaInicio - Hora inicio
 * @param {string} horaFin - Hora fin
 * @returns {boolean} True si inicio < fin
 */
export const horaMenorQue = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) return true;
  
  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFin.split(':').map(Number);
  
  const minutosInicio = h1 * 60 + m1;
  const minutosFin = h2 * 60 + m2;
  
  return minutosInicio < minutosFin;
};

/**
 * Valida una fecha
 * @param {string} fecha - Fecha a validar
 * @returns {boolean} True si es válida
 */
export const validarFecha = (fecha) => {
  if (!fecha) return false;
  
  const date = new Date(fecha);
  return date instanceof Date && !isNaN(date);
};

/**
 * Valida que una fecha no sea futura
 * @param {string} fecha - Fecha a validar
 * @returns {boolean} True si no es futura
 */
export const fechaNoFutura = (fecha) => {
  if (!fecha) return true;
  
  const fechaObj = new Date(fecha);
  const hoy = new Date();
  
  return fechaObj <= hoy;
};

/**
 * Valida que un texto tenga longitud mínima
 * @param {string} texto - Texto a validar
 * @param {number} min - Longitud mínima
 * @returns {boolean} True si cumple
 */
export const longitudMinima = (texto, min) => {
  if (!texto) return false;
  return texto.trim().length >= min;
};

/**
 * Valida que un texto tenga longitud máxima
 * @param {string} texto - Texto a validar
 * @param {number} max - Longitud máxima
 * @returns {boolean} True si cumple
 */
export const longitudMaxima = (texto, max) => {
  if (!texto) return true;
  return texto.trim().length <= max;
};

/**
 * Valida que un texto tenga longitud exacta
 * @param {string} texto - Texto a validar
 * @param {number} longitud - Longitud exacta
 * @returns {boolean} True si cumple
 */
export const longitudExacta = (texto, longitud) => {
  if (!texto) return false;
  return texto.trim().length === longitud;
};

/**
 * Valida que un valor sea un booleano
 * @param {any} valor - Valor a validar
 * @returns {boolean} True si es booleano
 */
export const esBooleano = (valor) => {
  return typeof valor === 'boolean';
};

/**
 * Valida que un valor sea un array
 * @param {any} valor - Valor a validar
 * @returns {boolean} True si es array
 */
export const esArray = (valor) => {
  return Array.isArray(valor);
};

/**
 * Valida que un array no esté vacío
 * @param {Array} array - Array a validar
 * @returns {boolean} True si no está vacío
 */
export const arrayNoVacio = (array) => {
  return Array.isArray(array) && array.length > 0;
};

/**
 * Valida un código de empleado
 * @param {string} codigo - Código a validar
 * @returns {boolean} True si es válido
 */
export const validarCodigoEmpleado = (codigo) => {
  if (!codigo) return false;
  
  // Puede ser numérico o alfanumérico
  const regex = /^[A-Za-z0-9-_]+$/;
  return regex.test(codigo);
};

/**
 * Valida un salario
 * @param {number} salario - Salario a validar
 * @returns {boolean} True si es válido
 */
export const validarSalario = (salario) => {
  if (!esNumerico(salario)) return false;
  const num = parseFloat(salario);
  return num > 0 && num < 1000000; // Máximo 1M de pesos
};

/**
 * Valida horas extras contra límite legal
 * @param {number} horas - Horas a validar
 * @param {number} acumuladoTrimestre - Horas acumuladas en el trimestre
 * @returns {Object} Resultado de la validación
 */
export const validarLimiteLegal = (horas, acumuladoTrimestre = 0) => {
  const LIMITE = 68; // 68 horas por trimestre
  
  if (acumuladoTrimestre + horas > LIMITE) {
    return {
      valido: false,
      mensaje: `Excede el límite legal de ${LIMITE} horas por trimestre`,
      permitido: Math.max(0, LIMITE - acumuladoTrimestre)
    };
  }
  
  return {
    valido: true,
    mensaje: 'Dentro del límite legal'
  };
};