// src/middleware/validation.js
import { body, param, query, validationResult } from 'express-validator';
import { HTTP_STATUS, TIPOS_JORNADA, REGEX } from '../utils/constants.js';

/**
 * Middleware para validar resultados
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      value: err.value,
      message: err.msg
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Error de validación',
      details: formattedErrors
    });
  };
};

// ============================================
// VALIDACIONES DE EMPLEADOS
// ============================================

export const validateEmpleado = [
  body('codigo')
    .notEmpty().withMessage('El código es requerido')
    .matches(/^[A-Za-z0-9-]+$/).withMessage('El código solo puede contener letras, números y guiones')
    .isLength({ min: 1, max: 20 }).withMessage('El código debe tener entre 1 y 20 caracteres')
    .trim()
    .toUpperCase(),
  
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios')
    .trim()
    .toUpperCase(),
  
  body('apellido')
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras y espacios')
    .trim()
    .toUpperCase(),
  
  body('salarioBase')
    .notEmpty().withMessage('El salario base es requerido')
    .isFloat({ min: 0 }).withMessage('El salario debe ser un número positivo')
    .custom(value => value > 0).withMessage('El salario debe ser mayor a 0')
    .toFloat(),
  
  body('posicion')
    .optional()
    .isLength({ max: 100 }).withMessage('La posición no puede exceder 100 caracteres')
    .trim(),
  
  body('departamento')
    .optional()
    .isLength({ max: 100 }).withMessage('El departamento no puede exceder 100 caracteres')
    .trim(),
  
  body('fechaIngreso')
    .optional()
    .isDate().withMessage('Fecha de ingreso inválida')
    .custom(value => new Date(value) <= new Date()).withMessage('La fecha de ingreso no puede ser futura'),
  
  body('tipoJornada')
    .optional()
    .isIn(Object.values(TIPOS_JORNADA)).withMessage('Tipo de jornada no válido')
];

// ============================================
// VALIDACIONES DE REGISTROS MANUALES
// ============================================

export const validateRegistroManual = [
  body('empleadoId')
    .notEmpty().withMessage('El ID del empleado es requerido')
    .isInt({ min: 1 }).withMessage('ID de empleado inválido'),
  
  body('fecha')
    .notEmpty().withMessage('La fecha es requerida')
    .isDate().withMessage('Fecha inválida'),
  
  body('horaEntrada')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Formato de hora inválido (use HH:MM)'),
  
  body('horaSalida')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Formato de hora inválido (use HH:MM)')
    .custom((value, { req }) => {
      if (req.body.horaEntrada && value) {
        const entrada = req.body.horaEntrada.split(':').map(Number);
        const salida = value.split(':').map(Number);
        const entradaMin = entrada[0] * 60 + entrada[1];
        const salidaMin = salida[0] * 60 + salida[1];
        
        if (salidaMin < entradaMin) {
          return true; // Permite cruce de medianoche
        }
        return salidaMin > entradaMin;
      }
      return true;
    }).withMessage('La hora de salida debe ser posterior a la entrada'),
  
  body('comentarios')
    .optional()
    .isLength({ max: 500 }).withMessage('Los comentarios no pueden exceder 500 caracteres')
];

// ============================================
// VALIDACIONES DE IMPORTACIÓN
// ============================================

export const validateImportacion = [
  body('archivo')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('No se ha subido ningún archivo');
      }
      return true;
    })
];

// ============================================
// VALIDACIONES DE ID
// ============================================

export const validateId = [
  param('id')
    .notEmpty().withMessage('El ID es requerido')
    .isInt({ min: 1 }).withMessage('ID inválido')
];

// ============================================
// VALIDACIONES DE PAGINACIÓN
// ============================================

export const validatePaginacion = [
  query('pagina')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo'),
  
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
];

// ============================================
// VALIDACIONES DE BÚSQUEDA
// ============================================

export const validateBusqueda = [
  query('q')
    .notEmpty().withMessage('El término de búsqueda es requerido')
    .isLength({ min: 2 }).withMessage('El término debe tener al menos 2 caracteres')
];

// ============================================
// VALIDACIONES DE QUINCENA
// ============================================

export const validateQuincena = [
  param('anio')
    .isInt({ min: 2000, max: 2100 }).withMessage('Año inválido'),
  
  param('mes')
    .isInt({ min: 1, max: 12 }).withMessage('Mes inválido'),
  
  param('quincena')
    .isInt({ min: 1, max: 2 }).withMessage('Quincena inválida (debe ser 1 o 2)')
];

// Exportar todo junto
export default {
  validate,
  validateEmpleado,
  validateRegistroManual,
  validateImportacion,
  validateId,
  validatePaginacion,
  validateBusqueda,
  validateQuincena
};