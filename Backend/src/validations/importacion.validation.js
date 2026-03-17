// src/validations/importacion.validation.js
import { body, param, query } from 'express-validator';
import { ESTADOS_IMPORTACION } from '../utils/constants.js';

class ImportacionValidation {
  /**
   * Validación para importar archivo
   */
  importar() {
    return [
      body('archivo')
        .custom((value, { req }) => {
          if (!req.file) {
            throw new Error('No se ha subido ningún archivo');
          }
          return true;
        })
    ];
  }

  /**
   * Validación para listar importaciones
   */
  listar() {
    return [
      query('estado')
        .optional()
        .isIn(Object.values(ESTADOS_IMPORTACION)).withMessage('Estado no válido'),

      query('pagina')
        .optional()
        .isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo')
        .toInt(),

      query('limite')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
        .toInt(),

      query('fechaInicio')
        .optional()
        .isDate().withMessage('Fecha de inicio inválida'),

      query('fechaFin')
        .optional()
        .isDate().withMessage('Fecha de fin inválida')
        .custom((value, { req }) => {
          if (req.query.fechaInicio && value) {
            const inicio = new Date(req.query.fechaInicio);
            const fin = new Date(value);
            if (fin < inicio) {
              throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
            }
          }
          return true;
        })
    ];
  }

  /**
   * Validación para obtener importación por ID
   */
  obtenerPorId() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('ID de importación inválido')
    ];
  }

  /**
   * Validación para procesar importación
   */
  procesar() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('ID de importación inválido')
    ];
  }

  /**
   * Validación para eliminar importación
   */
  eliminar() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('ID de importación inválido')
    ];
  }

  /**
   * Validación para obtener importaciones por período
   */
  porPeriodo() {
    return [
      query('fechaInicio')
        .notEmpty().withMessage('La fecha de inicio es requerida')
        .isDate().withMessage('Fecha de inicio inválida'),

      query('fechaFin')
        .notEmpty().withMessage('La fecha de fin es requerida')
        .isDate().withMessage('Fecha de fin inválida')
        .custom((value, { req }) => {
          const inicio = new Date(req.query.fechaInicio);
          const fin = new Date(value);
          if (fin < inicio) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
          }
          return true;
        }),

      query('pagina')
        .optional()
        .isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo')
        .toInt(),

      query('limite')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
        .toInt()
    ];
  }

  /**
   * Validación para validar estructura de Excel
   */
  validarEstructura() {
    return [
      body('archivo')
        .custom((value, { req }) => {
          if (!req.file) {
            throw new Error('No se ha subido ningún archivo');
          }
          return true;
        })
    ];
  }

  /**
   * Validación para descargar reporte de errores
   */
  descargarErrores() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('ID de importación inválido')
    ];
  }

  /**
   * Validación para reintentar registros con error
   */
  reintentarErrores() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('ID de importación inválido'),

      body('registrosIds')
        .optional()
        .isArray().withMessage('Debe proporcionar un array de IDs')
        .custom(ids => ids.every(id => Number.isInteger(id) && id > 0))
        .withMessage('Todos los IDs deben ser números enteros positivos')
    ];
  }
}

export default new ImportacionValidation();