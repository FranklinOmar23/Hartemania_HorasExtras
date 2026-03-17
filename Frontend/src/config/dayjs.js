import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Importar locale español
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

// ============================================
// CONFIGURACIÓN DE DAYJS
// Extensión de funcionalidades de fechas
// ============================================

// Extender plugins
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(quarterOfYear);

// Configurar locale español
dayjs.locale('es');

// Configurar zona horaria de República Dominicana
const TIMEZONE = 'America/Santo_Domingo';
dayjs.tz.setDefault(TIMEZONE);

// ============================================
// FUNCIONES PERSONALIZADAS
// ============================================

/**
 * Formatea una fecha según el formato especificado
 * @param {Date|string} fecha - Fecha a formatear
 * @param {string} formato - Formato deseado
 * @returns {string} Fecha formateada
 */
export const formatear = (fecha, formato = 'DD/MM/YYYY') => {
  if (!fecha) return '';
  return dayjs(fecha).format(formato);
};

/**
 * Formatea una fecha con hora
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatearConHora = (fecha) => {
  if (!fecha) return '';
  return dayjs(fecha).format('DD/MM/YYYY HH:mm');
};

/**
 * Formatea una hora
 * @param {string} hora - Hora en formato HH:mm
 * @returns {string} Hora formateada
 */
export const formatearHora = (hora) => {
  if (!hora) return '';
  if (hora.includes(':')) {
    return dayjs(`2000-01-01 ${hora}`).format('HH:mm');
  }
  return hora;
};

/**
 * Parsea una fecha desde string
 * @param {string} fechaStr - String de fecha
 * @param {string} formato - Formato de entrada
 * @returns {dayjs.Dayjs} Objeto dayjs
 */
export const parsear = (fechaStr, formato = 'DD/MM/YYYY') => {
  if (!fechaStr) return null;
  return dayjs(fechaStr, formato);
};

/**
 * Obtiene el inicio del día
 * @param {Date|string} fecha - Fecha
 * @returns {dayjs.Dayjs} Inicio del día
 */
export const inicioDia = (fecha) => {
  return dayjs(fecha).startOf('day');
};

/**
 * Obtiene el fin del día
 * @param {Date|string} fecha - Fecha
 * @returns {dayjs.Dayjs} Fin del día
 */
export const finDia = (fecha) => {
  return dayjs(fecha).endOf('day');
};

/**
 * Obtiene el rango de una quincena
 * @param {number} año - Año
 * @param {number} mes - Mes (1-12)
 * @param {number} quincena - 1 o 2
 * @returns {Object} Inicio y fin de la quincena
 */
export const getRangoQuincena = (año, mes, quincena) => {
  if (quincena === 1) {
    return {
      inicio: dayjs().year(año).month(mes - 1).date(1).startOf('day'),
      fin: dayjs().year(año).month(mes - 1).date(15).endOf('day')
    };
  } else {
    const ultimoDia = dayjs().year(año).month(mes - 1).endOf('month').date();
    return {
      inicio: dayjs().year(año).month(mes - 1).date(16).startOf('day'),
      fin: dayjs().year(año).month(mes - 1).date(ultimoDia).endOf('day')
    };
  }
};

/**
 * Calcula la diferencia en horas entre dos horas
 * @param {string} horaInicio - Hora inicio (HH:mm)
 * @param {string} horaFin - Hora fin (HH:mm)
 * @returns {number} Diferencia en horas
 */
export const diferenciaHoras = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) return 0;
  
  const inicio = dayjs(`2000-01-01 ${horaInicio}`);
  let fin = dayjs(`2000-01-01 ${horaFin}`);
  
  // Si la hora fin es menor, asumimos que pasó la medianoche
  if (fin.isBefore(inicio)) {
    fin = fin.add(1, 'day');
  }
  
  return fin.diff(inicio, 'hour', true);
};

/**
 * Suma minutos a una hora
 * @param {string} hora - Hora base
 * @param {number} minutos - Minutos a sumar
 * @returns {string} Nueva hora
 */
export const sumarMinutos = (hora, minutos) => {
  if (!hora) return '';
  return dayjs(`2000-01-01 ${hora}`)
    .add(minutos, 'minute')
    .format('HH:mm');
};

/**
 * Verifica si una fecha es fin de semana
 * @param {Date|string} fecha - Fecha a verificar
 * @returns {boolean} True si es sábado o domingo
 */
export const esFinSemana = (fecha) => {
  const dia = dayjs(fecha).day();
  return dia === 0 || dia === 6;
};

/**
 * Verifica si una fecha es feriado
 * @param {Date|string} fecha - Fecha a verificar
 * @param {Array} feriados - Lista de feriados
 * @returns {boolean} True si es feriado
 */
export const esFeriado = (fecha, feriados = []) => {
  const fechaStr = dayjs(fecha).format('DD/MM');
  return feriados.some(f => f.fecha === fechaStr);
};

/**
 * Obtiene el nombre del mes
 * @param {number} mes - Número del mes (1-12)
 * @param {boolean} corto - Si se quiere el nombre corto
 * @returns {string} Nombre del mes
 */
export const getNombreMes = (mes, corto = false) => {
  const fecha = dayjs().month(mes - 1);
  return corto ? fecha.format('MMM') : fecha.format('MMMM');
};

/**
 * Obtiene el nombre del día de la semana
 * @param {Date|string} fecha - Fecha
 * @param {boolean} corto - Si se quiere el nombre corto
 * @returns {string} Nombre del día
 */
export const getNombreDia = (fecha, corto = false) => {
  return corto 
    ? dayjs(fecha).format('ddd')
    : dayjs(fecha).format('dddd');
};

// ============================================
// EXPORTACIONES
// ============================================
export default {
  ...dayjs,
  formatear,
  formatearConHora,
  formatearHora,
  parsear,
  inicioDia,
  finDia,
  getRangoQuincena,
  diferenciaHoras,
  sumarMinutos,
  esFinSemana,
  esFeriado,
  getNombreMes,
  getNombreDia,
  TIMEZONE
};