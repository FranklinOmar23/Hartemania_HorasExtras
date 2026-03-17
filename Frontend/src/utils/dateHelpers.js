import { format, parse, differenceInHours, differenceInMinutes, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWeekend, isBefore, isAfter, areIntervalsOverlapping } from 'date-fns';
import { es } from 'date-fns/locale';

// ============================================
// FUNCIONES PARA MANEJO DE FECHAS
// ============================================

/**
 * Formatea una fecha al formato especificado
 * @param {Date|string} fecha - Fecha a formatear
 * @param {string} formato - Formato deseado (default: 'dd/MM/yyyy')
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (fecha, formato = 'dd/MM/yyyy') => {
  if (!fecha) return '';
  const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return format(dateObj, formato, { locale: es });
};

/**
 * Formatea una hora al formato HH:mm
 * @param {string} hora - Hora en formato 'HH:mm:ss' o 'HH:mm'
 * @returns {string} Hora formateada
 */
export const formatearHora = (hora) => {
  if (!hora) return '';
  if (hora.includes(':')) {
    const partes = hora.split(':');
    return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
  }
  return hora;
};

/**
 * Parsea una hora string a objeto Date
 * @param {string} horaStr - Hora en formato 'HH:mm'
 * @returns {Date} Objeto Date con la hora
 */
export const parsearHora = (horaStr) => {
  if (!horaStr) return null;
  const [horas, minutos] = horaStr.split(':').map(Number);
  const date = new Date();
  date.setHours(horas, minutos, 0, 0);
  return date;
};

/**
 * Convierte hora a número decimal (ej: 08:30 -> 8.5)
 * @param {string} hora - Hora en formato 'HH:mm'
 * @returns {number} Hora en formato decimal
 */
export const horaToDecimal = (hora) => {
  if (!hora) return 0;
  const [horas, minutos] = hora.split(':').map(Number);
  return horas + (minutos / 60);
};

/**
 * Convierte decimal a hora (ej: 8.5 -> '08:30')
 * @param {number} decimal - Hora en formato decimal
 * @returns {string} Hora en formato 'HH:mm'
 */
export const decimalToHora = (decimal) => {
  if (decimal === null || decimal === undefined) return '';
  const horas = Math.floor(decimal);
  const minutos = Math.round((decimal - horas) * 60);
  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
};

/**
 * Calcula la diferencia en horas entre dos horas
 * @param {string} horaInicio - Hora inicio 'HH:mm'
 * @param {string} horaFin - Hora fin 'HH:mm'
 * @returns {number} Diferencia en horas
 */
export const diferenciaHoras = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) return 0;
  
  const inicio = parsearHora(horaInicio);
  const fin = parsearHora(horaFin);
  
  let diff = (fin - inicio) / (1000 * 60 * 60);
  
  // Si la hora fin es menor, asumimos que pasó la medianoche
  if (diff < 0) {
    diff += 24;
  }
  
  return diff;
};

/**
 * Obtiene el nombre del día de la semana
 * @param {Date|string} fecha - Fecha
 * @param {boolean} corto - Si se quiere el nombre corto
 * @returns {string} Nombre del día
 */
export const getNombreDia = (fecha, corto = false) => {
  const dias = corto 
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    : ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return dias[dateObj.getDay()];
};

/**
 * Obtiene el nombre del mes
 * @param {number} mes - Número del mes (1-12)
 * @param {boolean} corto - Si se quiere el nombre corto
 * @returns {string} Nombre del mes
 */
export const getNombreMes = (mes, corto = false) => {
  const meses = corto
    ? ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  return meses[mes - 1];
};

/**
 * Verifica si una fecha es fin de semana
 * @param {Date|string} fecha - Fecha a verificar
 * @returns {boolean} True si es sábado o domingo
 */
export const esFinSemana = (fecha) => {
  const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return isWeekend(dateObj);
};

/**
 * Obtiene el rango de una quincena
 * @param {number} año - Año
 * @param {number} mes - Mes (1-12)
 * @param {number} quincena - 1 o 2
 * @returns {Object} Fecha inicio y fin
 */
export const getRangoQuincena = (año, mes, quincena) => {
  if (quincena === 1) {
    return {
      inicio: new Date(año, mes - 1, 1),
      fin: new Date(año, mes - 1, 15)
    };
  } else {
    const ultimoDia = new Date(año, mes, 0).getDate();
    return {
      inicio: new Date(año, mes - 1, 16),
      fin: new Date(año, mes - 1, ultimoDia)
    };
  }
};

/**
 * Valida si una hora es válida
 * @param {string} hora - Hora a validar
 * @returns {boolean} True si es válida
 */
export const validarHora = (hora) => {
  if (!hora) return false;
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(hora);
};

/**
 * Valida si una fecha es válida
 * @param {string} fecha - Fecha a validar
 * @returns {boolean} True si es válida
 */
export const validarFecha = (fecha) => {
  if (!fecha) return false;
  const date = new Date(fecha);
  return date instanceof Date && !isNaN(date);
};

/**
 * Obtiene la hora actual en formato HH:mm
 * @returns {string} Hora actual
 */
export const getHoraActual = () => {
  return format(new Date(), 'HH:mm');
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns {string} Fecha actual
 */
export const getFechaActual = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Suma minutos a una hora
 * @param {string} hora - Hora base 'HH:mm'
 * @param {number} minutos - Minutos a sumar
 * @returns {string} Nueva hora
 */
export const sumarMinutosAHora = (hora, minutos) => {
  const date = parsearHora(hora);
  date.setMinutes(date.getMinutes() + minutos);
  return format(date, 'HH:mm');
};

/**
 * Calcula horas nocturnas en un rango
 * @param {string} entrada - Hora entrada
 * @param {string} salida - Hora salida
 * @param {string} inicioNocturno - Inicio horario nocturno (default: '21:00')
 * @param {string} finNocturno - Fin horario nocturno (default: '07:00')
 * @returns {number} Horas nocturnas
 */
export const calcularHorasNocturnas = (entrada, salida, inicioNocturno = '21:00', finNocturno = '07:00') => {
  const horaEntrada = horaToDecimal(entrada);
  const horaSalida = horaToDecimal(salida);
  const inicioNoche = horaToDecimal(inicioNocturno);
  const finNoche = horaToDecimal(finNocturno);
  
  let horasNocturnas = 0;
  
  // Si la salida es después de inicio nocturno
  if (horaSalida > inicioNoche) {
    horasNocturnas = horaSalida - inicioNoche;
  }
  
  // Si pasó la medianoche
  if (horaSalida < horaEntrada) {
    horasNocturnas = (24 - inicioNoche) + horaSalida;
  }
  
  return Math.max(0, horasNocturnas);
};