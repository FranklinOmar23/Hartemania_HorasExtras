// src/validations/quincena.validation.js
import { param, query } from 'express-validator';

class QuincenaValidation {
  /**
   * Validación para calcular quincena
   */
  calcular() {
    return [
      param('anio')
        .isInt({ min: 2000, max: 2100 }).withMessage('Año inválido')
        .toInt(),

      param('mes')
        .isInt({ min: 1, max: 12 }).withMessage('Mes inválido')
        .toInt(),

      param('quincena')
        .isInt({ min: 1, max: 2 }).withMessage('Quincena inválida (debe ser 1 o 2)')
        .toInt()
    ];
  }

  /**
   * Validación para obtener resumen de quincena
   */
  obtenerResumen() {
    return [
      param('anio')
        .isInt({ min: 2000, max: 2100 }).withMessage('Año inválido')
        .toInt(),

      param('mes')
        .isInt({ min: 1, max: 12 }).withMessage('Mes inválido')
        .toInt(),

      param('quincena')
        .isInt({ min: 1, max: 2 }).withMessage('Quincena inválida (debe ser 1 o 2)')
        .toInt(),

      query('incluirDetalle')
        .optional()
        .isBoolean().withMessage('incluirDetalle debe ser verdadero o falso')
        .toBoolean()
    ];
  }

  /**
   * Validación para obtener resumen mensual
   */
  obtenerResumenMensual() {
    return [
      param('anio')
        .isInt({ min: 2000, max: 2100 }).withMessage('Año inválido')
        .toInt(),

      param('mes')
        .isInt({ min: 1, max: 12 }).withMessage('Mes inválido')
        .toInt()
    ];
  }

  /**
   * Validación para obtener histórico de empleado
   */
  obtenerHistoricoEmpleado() {
    return [
      param('empleadoId')
        .isInt({ min: 1 }).withMessage('ID de empleado inválido')
        .toInt(),

      query('limite')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
        .toInt()
    ];
  }

  /**
   * Validación para obtener ranking
   */
  obtenerRanking() {
    return [
      param('anio')
        .isInt({ min: 2000, max: 2100 }).withMessage('Año inválido')
        .toInt(),

      param('mes')
        .isInt({ min: 1, max: 12 }).withMessage('Mes inválido')
        .toInt(),

      param('quincena')
        .isInt({ min: 1, max: 2 }).withMessage('Quincena inválida (debe ser 1 o 2)')
        .toInt(),

      query('limite')
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage('El límite debe estar entre 1 y 50')
        .toInt()
    ];
  }

  /**
   * Validación para recalcular quincena
   */
  recalcular() {
    return [
      param('anio')
        .isInt({ min: 2000, max: 2100 }).withMessage('Año inválido')
        .toInt(),

      param('mes')
        .isInt({ min: 1, max: 12 }).withMessage('Mes inválido')
        .toInt(),

      param('quincena')
        .isInt({ min: 1, max: 2 }).withMessage('Quincena inválida (debe ser 1 o 2)')
        .toInt()
    ];
  }

  /**
   * Validación para obtener totales por período
   */
  obtenerTotales() {
    return [
      param('anio')
        .isInt({ min: 2000, max: 2100 }).withMessage('Año inválido')
        .toInt(),

      param('mes')
        .isInt({ min: 1, max: 12 }).withMessage('Mes inválido')
        .toInt(),

      param('quincena')
        .isInt({ min: 1, max: 2 }).withMessage('Quincena inválida (debe ser 1 o 2)')
        .toInt()
    ];
  }

  /**
   * Validación para exportar quincena
   */
  exportar() {
    return [
      param('anio')
        .isInt({ min: 2000, max: 2100 }).withMessage('Año inválido')
        .toInt(),

      param('mes')
        .isInt({ min: 1, max: 12 }).withMessage('Mes inválido')
        .toInt(),

      param('quincena')
        .isInt({ min: 1, max: 2 }).withMessage('Quincena inválida (debe ser 1 o 2)')
        .toInt(),

      query('formato')
        .optional()
        .isIn(['json', 'csv', 'excel', 'pdf']).withMessage('Formato no válido')
        .default('json')
    ];
  }

  /**
   * Validación para comparar quincenas
   */
  comparar() {
    return [
      query('anio1')
        .isInt({ min: 2000, max: 2100 }).withMessage('Año 1 inválido')
        .toInt(),

      query('mes1')
        .isInt({ min: 1, max: 12 }).withMessage('Mes 1 inválido')
        .toInt(),

      query('quincena1')
        .isInt({ min: 1, max: 2 }).withMessage('Quincena 1 inválida')
        .toInt(),

      query('anio2')
        .isInt({ min: 2000, max: 2100 }).withMessage('Año 2 inválido')
        .toInt(),

      query('mes2')
        .isInt({ min: 1, max: 12 }).withMessage('Mes 2 inválido')
        .toInt(),

      query('quincena2')
        .isInt({ min: 1, max: 2 }).withMessage('Quincena 2 inválida')
        .toInt()
    ];
  }

  /**
   * Validación para obtener resumen anual
   */
  obtenerResumenAnual() {
    return [
      param('anio')
        .isInt({ min: 2000, max: 2100 }).withMessage('Año inválido')
        .toInt(),

      param('empleadoId')
        .optional()
        .isInt({ min: 1 }).withMessage('ID de empleado inválido')
        .toInt()
    ];
  }
}

export default new QuincenaValidation();