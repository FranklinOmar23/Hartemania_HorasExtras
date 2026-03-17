// src/utils/dateHelpers.js
import moment from 'moment-timezone';

class DateHelpers {
  constructor() {
    this.timezone = 'America/Santo_Domingo';
    moment.tz.setDefault(this.timezone);
  }

  /**
   * Obtener fecha actual en formato YYYY-MM-DD
   */
  getToday() {
    return moment().format('YYYY-MM-DD');
  }

  /**
   * Obtener fecha y hora actual
   */
  getNow() {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * Formatear fecha
   */
  formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return null;
    return moment(date).format(format);
  }

  /**
   * Formatear hora
   */
  formatTime(time, format = 'HH:mm') {
    if (!time) return null;
    
    // Si es string HH:MM o HH:MM:SS
    if (typeof time === 'string') {
      const parts = time.split(':');
      if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      }
    }
    
    return moment(time, 'HH:mm').format(format);
  }

  /**
   * Parsear fecha desde string
   */
  parseDate(dateStr) {
    if (!dateStr) return null;
    
    // Formatos aceptados: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
    const formats = ['YYYY-MM-DD', 'DD/MM/YYYY', 'DD-MM-YYYY'];
    
    for (const format of formats) {
      const date = moment(dateStr, format);
      if (date.isValid()) {
        return date.toDate();
      }
    }
    
    return null;
  }

  /**
   * Validar fecha
   */
  isValidDate(date) {
    return moment(date).isValid();
  }

  /**
   * Validar hora
   */
  isValidTime(time) {
    if (!time) return false;
    return moment(time, 'HH:mm').isValid() || moment(time, 'HH:mm:ss').isValid();
  }

  /**
   * Obtener diferencia en horas entre dos horas
   */
  getHoursDifference(startTime, endTime) {
    const start = moment(startTime, 'HH:mm');
    const end = moment(endTime, 'HH:mm');
    
    let diff = end.diff(start, 'minutes');
    
    // Si cruza medianoche
    if (diff < 0) {
      diff += 24 * 60;
    }
    
    return diff / 60;
  }

  /**
   * Obtener diferencia en minutos
   */
  getMinutesDifference(startTime, endTime) {
    const start = moment(startTime, 'HH:mm');
    const end = moment(endTime, 'HH:mm');
    
    let diff = end.diff(start, 'minutes');
    
    if (diff < 0) {
      diff += 24 * 60;
    }
    
    return diff;
  }

  /**
   * Sumar horas a una hora
   */
  addHours(time, hours) {
    return moment(time, 'HH:mm').add(hours, 'hours').format('HH:mm');
  }

  /**
   * Obtener día de la semana (0-6)
   */
  getDayOfWeek(date) {
    return moment(date).day();
  }

  /**
   * Obtener nombre del día
   */
  getDayName(date, locale = 'es') {
    return moment(date).locale(locale).format('dddd');
  }

  /**
   * Obtener número de semana del año
   */
  getWeekNumber(date) {
    return moment(date).isoWeek();
  }

  /**
   * Obtener primer día del mes
   */
  getFirstDayOfMonth(year, month) {
    return moment(`${year}-${month}-01`).format('YYYY-MM-DD');
  }

  /**
   * Obtener último día del mes
   */
  getLastDayOfMonth(year, month) {
    return moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
  }

  /**
   * Obtener fechas de quincena
   */
  getQuincenaDates(year, month, quincena) {
    if (quincena === 1) {
      return {
        inicio: moment(`${year}-${month}-01`).format('YYYY-MM-DD'),
        fin: moment(`${year}-${month}-15`).format('YYYY-MM-DD')
      };
    } else {
      return {
        inicio: moment(`${year}-${month}-16`).format('YYYY-MM-DD'),
        fin: moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')
      };
    }
  }

  /**
   * Obtener rango de fechas para una quincena específica
   */
  getQuincenaRange(date) {
    const day = moment(date).date();
    const year = moment(date).year();
    const month = moment(date).month() + 1;
    
    if (day <= 15) {
      return {
        year,
        month,
        quincena: 1,
        inicio: moment(`${year}-${month}-01`).format('YYYY-MM-DD'),
        fin: moment(`${year}-${month}-15`).format('YYYY-MM-DD')
      };
    } else {
      return {
        year,
        month,
        quincena: 2,
        inicio: moment(`${year}-${month}-16`).format('YYYY-MM-DD'),
        fin: moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')
      };
    }
  }

  /**
   * Obtener edad desde fecha de nacimiento
   */
  getAge(birthDate) {
    return moment().diff(moment(birthDate), 'years');
  }

  /**
   * Obtener años de antigüedad
   */
  getSeniority(startDate) {
    return moment().diff(moment(startDate), 'years');
  }

  /**
   * Verificar si una fecha es fin de semana
   */
  isWeekend(date) {
    const day = moment(date).day();
    return day === 0 || day === 6;
  }

  /**
   * Verificar si una fecha es hoy
   */
  isToday(date) {
    return moment(date).isSame(moment(), 'day');
  }

  /**
   * Verificar si una fecha está en el rango
   */
  isBetween(date, start, end) {
    return moment(date).isBetween(start, end, 'day', '[]');
  }

  /**
   * Obtener lista de fechas entre un rango
   */
  getDatesBetween(start, end) {
    const dates = [];
    const current = moment(start);
    const last = moment(end);
    
    while (current <= last) {
      dates.push(current.format('YYYY-MM-DD'));
      current.add(1, 'day');
    }
    
    return dates;
  }

  /**
   * Convertir minutos a formato HH:MM
   */
  minutesToHours(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Convertir horas a minutos
   */
  hoursToMinutes(hours) {
    const [h, m] = hours.split(':').map(Number);
    return h * 60 + (m || 0);
  }
}

export default new DateHelpers();