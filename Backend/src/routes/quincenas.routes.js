// src/routes/quincenas.routes.js
import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import quincenaValidation from '../validations/quincena.validation.js';
import QuincenaController from '../controllers/QuincenaController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Quincenas
 *   description: Gestión de quincenas y resúmenes
 */

/**
 * @swagger
 * /quincenas/comparar:
 *   get:
 *     summary: Compara dos quincenas
 *     tags: [Quincenas]
 *     parameters:
 *       - in: query
 *         name: anio1
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: mes1
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: quincena1
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: anio2
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: mes2
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: quincena2
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comparación de quincenas
 */
router.get(
  '/comparar',
  validate(quincenaValidation.comparar()),
  QuincenaController.comparar
);

/**
 * @swagger
 * /quincenas/ranking/{anio}/{mes}/{quincena}:
 *   get:
 *     summary: Obtiene ranking de empleados por horas extras
 *     tags: [Quincenas]
 *     parameters:
 *       - in: path
 *         name: anio
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: mes
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: quincena
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Ranking de empleados
 */
router.get(
  '/ranking/:anio/:mes/:quincena',
  validate(quincenaValidation.obtenerRanking()),
  QuincenaController.ranking
);

/**
 * @swagger
 * /quincenas/empleado/{empleadoId}:
 *   get:
 *     summary: Obtiene histórico de quincenas de un empleado
 *     tags: [Quincenas]
 *     parameters:
 *       - in: path
 *         name: empleadoId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Histórico del empleado
 */
router.get(
  '/empleado/:empleadoId',
  validate(quincenaValidation.obtenerHistoricoEmpleado()),
  QuincenaController.historicoEmpleado
);

/**
 * @swagger
 * /quincenas/mensual/{anio}/{mes}:
 *   get:
 *     summary: Obtiene resumen mensual (ambas quincenas)
 *     tags: [Quincenas]
 *     parameters:
 *       - in: path
 *         name: anio
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: mes
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resumen mensual
 */
router.get(
  '/mensual/:anio/:mes',
  validate(quincenaValidation.obtenerResumenMensual()),
  QuincenaController.obtenerMensual
);

/**
 * @swagger
 * /quincenas/totales/{anio}/{mes}/{quincena}:
 *   get:
 *     summary: Obtiene totales de una quincena
 *     tags: [Quincenas]
 *     parameters:
 *       - in: path
 *         name: anio
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: mes
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: quincena
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Totales de la quincena
 */
router.get(
  '/totales/:anio/:mes/:quincena',
  validate(quincenaValidation.obtenerTotales()),
  QuincenaController.totales
);

/**
 * @swagger
 * /quincenas/exportar/{anio}/{mes}/{quincena}:
 *   get:
 *     summary: Exporta quincena a CSV o JSON
 *     tags: [Quincenas]
 *     parameters:
 *       - in: path
 *         name: anio
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: mes
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: quincena
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: formato
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *     responses:
 *       200:
 *         description: Archivo exportado
 */
router.get(
  '/exportar/:anio/:mes/:quincena',
  validate(quincenaValidation.exportar()),
  QuincenaController.exportar
);

/**
 * @swagger
 * /quincenas/{anio}/{mes}/{quincena}:
 *   get:
 *     summary: Obtiene resumen de una quincena específica
 *     tags: [Quincenas]
 *     parameters:
 *       - in: path
 *         name: anio
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: mes
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: quincena
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: incluirDetalle
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Resumen de la quincena
 */
router.get(
  '/:anio/:mes/:quincena',
  validate(quincenaValidation.obtenerResumen()),
  QuincenaController.obtenerResumen
);

/**
 * @swagger
 * /quincenas/calcular/{anio}/{mes}/{quincena}:
 *   post:
 *     summary: Calcula una quincena
 *     tags: [Quincenas]
 *     parameters:
 *       - in: path
 *         name: anio
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: mes
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: quincena
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quincena calculada
 */
router.post(
  '/calcular/:anio/:mes/:quincena',
  validate(quincenaValidation.calcular()),
  QuincenaController.calcular
);

/**
 * @swagger
 * /quincenas/recalcular/{anio}/{mes}/{quincena}:
 *   post:
 *     summary: Recalcula una quincena (borra y recalcula)
 *     tags: [Quincenas]
 *     parameters:
 *       - in: path
 *         name: anio
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: mes
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: quincena
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quincena recalculada
 */
router.post(
  '/recalcular/:anio/:mes/:quincena',
  validate(quincenaValidation.recalcular()),
  QuincenaController.recalcular
);

export default router;