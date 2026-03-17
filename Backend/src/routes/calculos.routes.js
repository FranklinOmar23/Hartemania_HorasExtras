// src/routes/calculos.routes.js
import { Router } from 'express';
import CalculoController from '../controllers/CalculoController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cálculos
 *   description: Cálculo de horas extras
 */

/**
 * @swagger
 * /calculos/estadisticas:
 *   get:
 *     summary: Obtiene estadísticas de cálculos
 *     tags: [Cálculos]
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Estadísticas de cálculos
 */
router.get('/estadisticas', CalculoController.estadisticas);

/**
 * @swagger
 * /calculos/validar-limite/{empleadoId}:
 *   get:
 *     summary: Valida el límite legal de horas extras para un empleado
 *     tags: [Cálculos]
 *     parameters:
 *       - in: path
 *         name: empleadoId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *       - in: query
 *         name: mes
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resultado de la validación
 */
router.get('/validar-limite/:empleadoId', CalculoController.validarLimite);

/**
 * @swagger
 * /calculos/registro/{id}/detalle:
 *   get:
 *     summary: Obtiene el detalle de cálculo de un registro
 *     tags: [Cálculos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del cálculo
 *       404:
 *         description: Registro no encontrado
 */
router.get('/registro/:id/detalle', CalculoController.detalleRegistro);

/**
 * @swagger
 * /calculos/registro/{id}:
 *   post:
 *     summary: Calcula horas extras para un registro específico
 *     tags: [Cálculos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cálculo realizado
 *       404:
 *         description: Registro no encontrado
 */
router.post('/registro/:id', CalculoController.calcularRegistro);

/**
 * @swagger
 * /calculos/masivo:
 *   post:
 *     summary: Calcula horas extras para múltiples registros
 *     tags: [Cálculos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrosIds
 *             properties:
 *               registrosIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Cálculo masivo completado
 */
router.post('/masivo', CalculoController.calcularMasivo);

/**
 * @swagger
 * /calculos/pendientes:
 *   post:
 *     summary: Calcula todos los registros pendientes de un período
 *     tags: [Cálculos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fechaInicio:
 *                 type: string
 *                 format: date
 *               fechaFin:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Cálculo de pendientes completado
 */
router.post('/pendientes', CalculoController.calcularPendientes);

/**
 * @swagger
 * /calculos/registro/{id}/recalcular:
 *   post:
 *     summary: Recalcula un registro (borra cálculos existentes)
 *     tags: [Cálculos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registro recalculado
 */
router.post('/registro/:id/recalcular', CalculoController.recalcular);

/**
 * @swagger
 * /calculos/programar:
 *   post:
 *     summary: Programa cálculo automático
 *     tags: [Cálculos]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hora:
 *                 type: string
 *                 example: "02:00"
 *     responses:
 *       200:
 *         description: Cálculo programado
 */
router.post('/programar', CalculoController.programar);

export default router;