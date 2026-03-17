// src/validations/empleado.validation.js
import { body, param, query } from 'express-validator';
import { TIPOS_JORNADA, REGEX } from '../utils/constants.js';

class EmpleadoValidation {
  /**
   * Validación para crear empleado
   */
  crear() {
    return [
      body('codigo')
        .notEmpty().withMessage('El código es requerido')
        .matches(REGEX.CODIGO_EMPLEADO).withMessage('El código solo puede contener letras, números y guiones')
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

      body('posicion')
        .optional()
        .isLength({ max: 100 }).withMessage('La posición no puede exceder 100 caracteres')
        .trim(),

      body('departamento')
        .optional()
        .isLength({ max: 100 }).withMessage('El departamento no puede exceder 100 caracteres')
        .trim(),

      body('salarioBase')
        .notEmpty().withMessage('El salario base es requerido')
        .isFloat({ min: 0 }).withMessage('El salario debe ser un número positivo')
        .custom(value => value > 0).withMessage('El salario debe ser mayor a 0')
        .toFloat(),

      body('fechaIngreso')
        .optional()
        .isDate().withMessage('Fecha de ingreso inválida')
        .custom(value => {
          const fecha = new Date(value);
          const hoy = new Date();
          return fecha <= hoy;
        }).withMessage('La fecha de ingreso no puede ser futura')
        .toDate(),

      body('tipoJornada')
        .optional()
        .isIn(Object.values(TIPOS_JORNADA)).withMessage('Tipo de jornada no válido')
        .default(TIPOS_JORNADA.DIURNA)
    ];
  }

  /**
   * Validación para actualizar empleado
   */
  actualizar() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('ID de empleado inválido'),

      body('codigo')
        .optional()
        .matches(REGEX.CODIGO_EMPLEADO).withMessage('El código solo puede contener letras, números y guiones')
        .isLength({ min: 1, max: 20 }).withMessage('El código debe tener entre 1 y 20 caracteres')
        .trim()
        .toUpperCase(),

      body('nombre')
        .optional()
        .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios')
        .trim()
        .toUpperCase(),

      body('apellido')
        .optional()
        .isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres')
        .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras y espacios')
        .trim()
        .toUpperCase(),

      body('posicion')
        .optional()
        .isLength({ max: 100 }).withMessage('La posición no puede exceder 100 caracteres')
        .trim(),

      body('departamento')
        .optional()
        .isLength({ max: 100 }).withMessage('El departamento no puede exceder 100 caracteres')
        .trim(),

      body('salarioBase')
        .optional()
        .isFloat({ min: 0 }).withMessage('El salario debe ser un número positivo')
        .custom(value => value > 0).withMessage('El salario debe ser mayor a 0')
        .toFloat(),

      body('fechaIngreso')
        .optional()
        .isDate().withMessage('Fecha de ingreso inválida')
        .custom(value => {
          const fecha = new Date(value);
          const hoy = new Date();
          return fecha <= hoy;
        }).withMessage('La fecha de ingreso no puede ser futura')
        .toDate(),

      body('tipoJornada')
        .optional()
        .isIn(Object.values(TIPOS_JORNADA)).withMessage('Tipo de jornada no válido'),

      body('activo')
        .optional()
        .isBoolean().withMessage('Activo debe ser verdadero o falso')
        .toBoolean()
    ];
  }

  /**
   * Validación para obtener empleado por ID
   */
  obtenerPorId() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('ID de empleado inválido')
    ];
  }

  /**
   * Validación para obtener empleado por código
   */
  obtenerPorCodigo() {
    return [
      param('codigo')
        .notEmpty().withMessage('El código es requerido')
        .matches(REGEX.CODIGO_EMPLEADO).withMessage('Código inválido')
    ];
  }

  /**
   * Validación para listar empleados
   */
  listar() {
    return [
      query('activo')
        .optional()
        .isBoolean().withMessage('Activo debe ser verdadero o falso')
        .toBoolean(),

      query('pagina')
        .optional()
        .isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo')
        .toInt(),

      query('limite')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
        .toInt(),

      query('departamento')
        .optional()
        .isLength({ max: 100 }).withMessage('Departamento inválido')
        .trim(),

      query('tipoJornada')
        .optional()
        .isIn(Object.values(TIPOS_JORNADA)).withMessage('Tipo de jornada no válido')
    ];
  }

  /**
   * Validación para buscar empleados
   */
  buscar() {
    return [
      query('q')
        .notEmpty().withMessage('El término de búsqueda es requerido')
        .isLength({ min: 2 }).withMessage('El término debe tener al menos 2 caracteres')
        .trim(),

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
   * Validación para eliminar empleado
   */
  eliminar() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('ID de empleado inválido')
    ];
  }

  /**
   * Validación para actualización masiva de salarios
   */
  actualizarSalariosMasivo() {
    return [
      body('empleadosIds')
        .isArray({ min: 1 }).withMessage('Debe proporcionar al menos un empleado')
        .custom(ids => ids.every(id => Number.isInteger(id) && id > 0))
        .withMessage('Todos los IDs deben ser números enteros positivos'),

      body('nuevoSalario')
        .notEmpty().withMessage('El nuevo salario es requerido')
        .isFloat({ min: 0 }).withMessage('El salario debe ser un número positivo')
        .custom(value => value > 0).withMessage('El salario debe ser mayor a 0')
        .toFloat()
    ];
  }
}

export default new EmpleadoValidation();