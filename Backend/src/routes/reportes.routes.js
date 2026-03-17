// src/routes/reportes.routes.js
import { Router } from 'express';
import ReporteController from '../controllers/ReporteController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Generación de reportes
 */

/**
 * @swagger
 * /reportes/quincenal/{anio}/{mes}/{quincena}:
 *   get:
 *     summary: Genera reporte quincenal
 *     tags: [Reportes]
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
 *           enum: [json, csv, excel]
 *           default: json
 *     responses:
 *       200:
 *         description: Reporte quincenal
 */
router.get('/quincenal/:anio/:mes/:quincena', ReporteController.quincenal);

/**
 * @swagger
 * /reportes/mensual/{anio}/{mes}:
 *   get:
 *     summary: Genera reporte mensual
 *     tags: [Reportes]
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
 *       - in: query
 *         name: formato
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *           default: json
 *     responses:
 *       200:
 *         description: Reporte mensual
 */
router.get('/mensual/:anio/:mes', ReporteController.mensual);

/**
 * @swagger
 * /reportes/anual/{anio}:
 *   get:
 *     summary: Genera reporte anual
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: anio
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: formato
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *           default: json
 *     responses:
 *       200:
 *         description: Reporte anual
 */
router.get('/anual/:anio', ReporteController.anual);

/**
 * @swagger
 * /reportes/empleado/{empleadoId}:
 *   get:
 *     summary: Genera reporte por empleado
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: empleadoId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fechaInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaFin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: formato
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *           default: json
 *     responses:
 *       200:
 *         description: Reporte del empleado
 */
router.get('/empleado/:empleadoId', ReporteController.empleado);

/**
 * @swagger
 * /reportes/importaciones:
 *   get:
 *     summary: Genera reporte de importaciones
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaFin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: formato
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *           default: json
 *     responses:
 *       200:
 *         description: Reporte de importaciones
 */
router.get('/importaciones', ReporteController.importaciones);

/**
 * @swagger
 * /reportes/comparativo:
 *   get:
 *     summary: Genera reporte comparativo entre dos quincenas
 *     tags: [Reportes]
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
 *         description: Reporte comparativo
 */
router.get('/comparativo', ReporteController.comparativo);

/**
 * @swagger
 * /reportes/download/{filename}:
 *   get:
 *     summary: Descarga un archivo de reporte generado
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archivo descargado
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/download/:filename', ReporteController.descargar);

/**
 * @swagger
 * /reportes/programar:
 *   post:
 *     summary: Programa envío automático de reportes
 *     tags: [Reportes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - frecuencia
 *               - email
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [quincenal, mensual, anual]
 *               frecuencia:
 *                 type: string
 *                 enum: [diario, semanal, quincenal, mensual]
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reporte programado
 */
router.post('/programar', ReporteController.programar);

export default router;