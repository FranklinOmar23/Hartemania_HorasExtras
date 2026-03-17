// src/utils/validators.js
import { REGEX } from './constants.js';
import dateHelpers from './dateHelpers.js';

class Validators {
  /**
   * Validar que un valor no esté vacío
   */
  required(value, fieldName = 'Campo') {
    if (value === undefined || value === null || value === '') {
      return {
        valid: false,
        message: `${fieldName} es requerido`
      };
    }
    return { valid: true };
  }

  /**
   * Validar longitud mínima
   */
  minLength(value, min, fieldName = 'Campo') {
    if (value && value.length < min) {
      return {
        valid: false,
        message: `${fieldName} debe tener al menos ${min} caracteres`
      };
    }
    return { valid: true };
  }

  /**
   * Validar longitud máxima
   */
  maxLength(value, max, fieldName = 'Campo') {
    if (value && value.length > max) {
      return {
        valid: false,
        message: `${fieldName} no puede exceder ${max} caracteres`
      };
    }
    return { valid: true };
  }

  /**
   * Validar rango de longitud
   */
  length(value, min, max, fieldName = 'Campo') {
    if (value) {
      if (value.length < min || value.length > max) {
        return {
          valid: false,
          message: `${fieldName} debe tener entre ${min} y ${max} caracteres`
        };
      }
    }
    return { valid: true };
  }

  /**
   * Validar número entero
   */
  integer(value, fieldName = 'Campo') {
    if (value !== undefined && value !== null) {
      if (!Number.isInteger(Number(value))) {
        return {
          valid: false,
          message: `${fieldName} debe ser un número entero`
        };
      }
    }
    return { valid: true };
  }

  /**
   * Validar número positivo
   */
  positive(value, fieldName = 'Campo') {
    if (value !== undefined && value !== null) {
      if (Number(value) <= 0) {
        return {
          valid: false,
          message: `${fieldName} debe ser un número positivo`
        };
      }
    }
    return { valid: true };
  }

  /**
   * Validar rango numérico
   */
  range(value, min, max, fieldName = 'Campo') {
    if (value !== undefined && value !== null) {
      const num = Number(value);
      if (num < min || num > max) {
        return {
          valid: false,
          message: `${fieldName} debe estar entre ${min} y ${max}`
        };
      }
    }
    return { valid: true };
  }

  /**
   * Validar email
   */
  email(value, fieldName = 'Email') {
    if (value && !REGEX.EMAIL.test(value)) {
      return {
        valid: false,
        message: `${fieldName} no es válido`
      };
    }
    return { valid: true };
  }

  /**
   * Validar fecha
   */
  date(value, fieldName = 'Fecha') {
    if (value && !dateHelpers.isValidDate(value)) {
      return {
        valid: false,
        message: `${fieldName} no es válida`
      };
    }
    return { valid: true };
  }

  /**
   * Validar hora
   */
  time(value, fieldName = 'Hora') {
    if (value && !dateHelpers.isValidTime(value)) {
      return {
        valid: false,
        message: `${fieldName} no es válida (formato HH:MM)`
      };
    }
    return { valid: true };
  }

  /**
   * Validar código de empleado
   */
  employeeCode(value, fieldName = 'Código') {
    if (value && !REGEX.CODIGO_EMPLEADO.test(value)) {
      return {
        valid: false,
        message: `${fieldName} solo puede contener letras, números y guiones`
      };
    }
    return { valid: true };
  }

  /**
   * Validar teléfono de RD
   */
  phoneRD(value, fieldName = 'Teléfono') {
    if (value && !REGEX.TELEFONO_RD.test(value)) {
      return {
        valid: false,
        message: `${fieldName} no es válido (formato: 809-555-1234)`
      };
    }
    return { valid: true };
  }

  /**
   * Validar que hora de salida sea posterior a hora de entrada
   */
  horaSalidaPosterior(entrada, salida) {
    if (entrada && salida) {
      const diff = dateHelpers.getMinutesDifference(entrada, salida);
      if (diff <= 0) {
        return {
          valid: false,
          message: 'La hora de salida debe ser posterior a la hora de entrada'
        };
      }
    }
    return { valid: true };
  }

  /**
   * Validar que no exceda 24 horas
   */
  maxHorasTrabajadas(entrada, salida, maxHoras = 24) {
    if (entrada && salida) {
      const horas = dateHelpers.getHoursDifference(entrada, salida);
      if (horas > maxHoras) {
        return {
          valid: false,
          message: `Las horas trabajadas no pueden exceder ${maxHoras} horas`
        };
      }
    }
    return { valid: true };
  }

  /**
   * Validar archivo Excel
   */
  excelFile(file) {
    if (!file) {
      return {
        valid: false,
        message: 'No se ha subido ningún archivo'
      };
    }

    const extension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];

    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        message: `Solo se permiten archivos: ${allowedExtensions.join(', ')}`
      };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        message: `El archivo excede el tamaño máximo de ${maxSize / 1024 / 1024}MB`
      };
    }

    return { valid: true };
  }

  /**
   * Validar período de fechas
   */
  dateRange(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) {
      return { valid: true };
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin < inicio) {
      return {
        valid: false,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      };
    }

    return { valid: true };
  }

  /**
   * Validar objeto con múltiples campos
   */
  validateObject(obj, validations) {
    const errors = [];

    for (const [field, rules] of Object.entries(validations)) {
      const value = obj[field];

      for (const rule of rules) {
        const result = rule.validator(value, rule.fieldName || field);
        if (!result.valid) {
          errors.push({
            field,
            value,
            message: result.message
          });
          break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar que el valor esté en una lista
   */
  inList(value, list, fieldName = 'Campo') {
    if (value && !list.includes(value)) {
      return {
        valid: false,
        message: `${fieldName} debe ser uno de: ${list.join(', ')}`
      };
    }
    return { valid: true };
  }

  /**
   * Validar que sea único (para usar con repositorio)
   */
  async unique(value, repository, field, excludeId = null, fieldName = 'Campo') {
    if (!value) return { valid: true };

    const exists = await repository.findOneByField(field, value);
    
    if (exists && (!excludeId || exists.Id !== excludeId)) {
      return {
        valid: false,
        message: `${fieldName} ya está en uso`
      };
    }

    return { valid: true };
  }
}

export default new Validators();