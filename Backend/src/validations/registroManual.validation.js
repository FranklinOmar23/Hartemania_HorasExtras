// src/validations/registroManual.validation.js
import { body, param, query } from 'express-validator';
import { TIPOS_REGISTRO, REGEX } from '../utils/constants.js';

class RegistroManualValidation {
  /**
   * Validación para crear registro manual
   */
  crear() {
    return [
      body('empleadoId')
        .notEmpty().withMessage('El ID del empleado es requerido')
        .isInt({ min: 1 }).withMessage('ID de empleado inválido')
        .toInt(),

      body('fecha')
        .notEmpty().withMessage('La fecha es requerida')
        .matches(REGEX.FECHA).withMessage('Formato de fecha inválido (YYYY-MM-DD)')
        .custom(value => {
          const fecha = new Date(value);
          const hoy = new Date();
          return fecha <= hoy;
        }).withMessage('La fecha no puede ser futura'),

      body('horaEntrada')
        .optional({ nullable: true })
        .matches(REGEX.HORA).withMessage('Formato de hora inválido (HH:MM)'),

      body('horaSalida')
        .optional({ nullable: true })
        .matches(REGEX.HORA).withMessage('Formato de hora inválido (HH:MM)')
        .custom((value, { req }) => {
          if (req.body.horaEntrada && value) {
            const entrada = req.body.horaEntrada;
            const salida = value;
            
            // Validar que salida sea posterior a entrada
            const [hEnt, mEnt] = entrada.split(':').map(Number);
            const [hSal, mSal] = salida.split(':').map(Number);
            
            const minutosEntrada = hEnt * 60 + mEnt;
            const minutosSalida = hSal * 60 + mSal;
            
            // Permitir cruce de medianoche
            if (minutosSalida < minutosEntrada) {
              return true; // Cruza medianoche, es válido
            }
            
            if (minutosSalida <= minutosEntrada) {
              throw new Error('La hora de salida debe ser posterior a la hora de entrada');
            }
            
            // Validar que no exceda 24 horas
            const diff = minutosSalida - minutosEntrada;
            if (diff > 24 * 60) {
              throw new Error('Las horas trabajadas no pueden exceder 24 horas');
            }
          }
          return true;
        }),

      body('comentarios')
        .optional()
        .isLength({ max: 500 }).withMessage('Los comentarios no pueden exceder 500 caracteres')
        .trim(),

      body('tipoRegistro')
        .optional()
        .isIn([TIPOS_REGISTRO.MANUAL]).withMessage('Tipo de registro no válido')
        .default(TIPOS_REGISTRO.MANUAL)
    ];
  }

  /**
   * Validación para actualizar registro manual
   */
  actualizar() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('ID de registro inválido')
        .toInt(),

      body('horaEntrada')
        .optional({ nullable: true })
        .matches(REGEX.HORA).withMessage('Formato de hora inválido (HH:MM)'),

      body('horaSalida')
        .optional({ nullable: true })
        .matches(REGEX.HORA).withMessage('Formato de hora inválido (HH:MM)')
        .custom((value, { req }) => {
          if (req.body.horaEntrada && value) {
            const entrada = req.body.horaEntrada;
            const salida = value;
            
            const [hEnt, mEnt] = entrada.split(':').map(Number);
            const [hSal, mSal] = salida.split(':').map(Number);
            
            const minutosEntrada = hEnt * 60 + mEnt;
            const minutosSalida = hSal * 60 + mSal;
            
            if (minutosSalida < minutosEntrada) {
              return true;
            }
            
            if (minutosSalida <= minutosEntrada) {
              throw new Error('La hora de salida debe ser posterior a la hora de entrada');
            }
          }
          return true;
        }),

      body('comentarios')
        .optional()
        .isLength({ max: 500 }).withMessage('Los comentarios no pueden exceder 500 caracteres')
        .trim()
    ];
  }

  /**
   * Validación para eliminar registro manual
   */
  eliminar() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('ID de registro inválido')
        .toInt()
    ];
  }

  /**
   * Validación para obtener registro por ID
   */
  obtenerPorId() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('ID de registro inválido')
        .toInt(),

      query('incluirCalculos')
        .optional()
        .isBoolean().withMessage('incluirCalculos debe ser verdadero o falso')
        .toBoolean()
    ];
  }

  /**
   * Validación para listar registros por empleado
   */
  listarPorEmpleado() {
    return [
      param('empleadoId')
        .isInt({ min: 1 }).withMessage('ID de empleado inválido')
        .toInt(),

      query('fechaInicio')
        .optional()
        .matches(REGEX.FECHA).withMessage('Formato de fecha inválido (YYYY-MM-DD)'),

      query('fechaFin')
        .optional()
        .matches(REGEX.FECHA).withMessage('Formato de fecha inválido (YYYY-MM-DD)')
        .custom((value, { req }) => {
          if (req.query.fechaInicio && value) {
            const inicio = new Date(req.query.fechaInicio);
            const fin = new Date(value);
            if (fin < inicio) {
              throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
            }
          }
          return true;
        }),

      query('procesado')
        .optional()
        .isBoolean().withMessage('procesado debe ser verdadero o falso')
        .toBoolean()
    ];
  }

  /**
   * Validación para marcar entrada
   */
  marcarEntrada() {
    return [
      body('empleadoId')
        .notEmpty().withMessage('El ID del empleado es requerido')
        .isInt({ min: 1 }).withMessage('ID de empleado inválido')
        .toInt(),

      body('fecha')
        .notEmpty().withMessage('La fecha es requerida')
        .matches(REGEX.FECHA).withMessage('Formato de fecha inválido (YYYY-MM-DD)')
        .custom(value => {
          const fecha = new Date(value);
          const hoy = new Date();
          return fecha <= hoy;
        }).withMessage('La fecha no puede ser futura'),

      body('horaEntrada')
        .notEmpty().withMessage('La hora de entrada es requerida')
        .matches(REGEX.HORA).withMessage('Formato de hora inválido (HH:MM)')
    ];
  }

  /**
   * Validación para marcar salida
   */
  marcarSalida() {
    return [
      body('empleadoId')
        .notEmpty().withMessage('El ID del empleado es requerido')
        .isInt({ min: 1 }).withMessage('ID de empleado inválido')
        .toInt(),

      body('fecha')
        .notEmpty().withMessage('La fecha es requerida')
        .matches(REGEX.FECHA).withMessage('Formato de fecha inválido (YYYY-MM-DD)')
        .custom(value => {
          const fecha = new Date(value);
          const hoy = new Date();
          return fecha <= hoy;
        }).withMessage('La fecha no puede ser futura'),

      body('horaSalida')
        .notEmpty().withMessage('La hora de salida es requerida')
        .matches(REGEX.HORA).withMessage('Formato de hora inválido (HH:MM)')
    ];
  }

  /**
   * Validación para registros masivos
   */
  crearMasivo() {
    return [
      body('registros')
        .isArray({ min: 1, max: 100 }).withMessage('Debe proporcionar entre 1 y 100 registros'),

      body('registros.*.empleadoId')
        .notEmpty().withMessage('El ID del empleado es requerido')
        .isInt({ min: 1 }).withMessage('ID de empleado inválido'),

      body('registros.*.fecha')
        .notEmpty().withMessage('La fecha es requerida')
        .matches(REGEX.FECHA).withMessage('Formato de fecha inválido'),

      body('registros.*.horaEntrada')
        .optional({ nullable: true })
        .matches(REGEX.HORA).withMessage('Formato de hora inválido'),

      body('registros.*.horaSalida')
        .optional({ nullable: true })
        .matches(REGEX.HORA).withMessage('Formato de hora inválido'),

      body('registros.*.comentarios')
        .optional()
        .isLength({ max: 500 }).withMessage('Los comentarios no pueden exceder 500 caracteres')
    ];
  }

  /**
   * Validación para obtener registros pendientes
   */
  pendientes() {
    return [
      query('fechaInicio')
        .optional()
        .matches(REGEX.FECHA).withMessage('Formato de fecha inválido'),

      query('fechaFin')
        .optional()
        .matches(REGEX.FECHA).withMessage('Formato de fecha inválido'),

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
   * Validación para obtener estadísticas
   */
  estadisticas() {
    return [
      param('empleadoId')
        .isInt({ min: 1 }).withMessage('ID de empleado inválido')
        .toInt(),

      query('fechaInicio')
        .notEmpty().withMessage('La fecha de inicio es requerida')
        .matches(REGEX.FECHA).withMessage('Formato de fecha inválido'),

      query('fechaFin')
        .notEmpty().withMessage('La fecha de fin es requerida')
        .matches(REGEX.FECHA).withMessage('Formato de fecha inválido')
        .custom((value, { req }) => {
          const inicio = new Date(req.query.fechaInicio);
          const fin = new Date(value);
          if (fin < inicio) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
          }
          return true;
        })
    ];
  }

  /**
   * Validación para verificar existencia
   */
  verificarExistencia() {
    return [
      query('empleadoId')
        .isInt({ min: 1 }).withMessage('ID de empleado inválido')
        .toInt(),

      query('fecha')
        .matches(REGEX.FECHA).withMessage('Formato de fecha inválido')
    ];
  }
}

export default new RegistroManualValidation();