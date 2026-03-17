// src/routes/importacion.routes.js
import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import upload, { handleUploadErrors, validateFileExists } from '../middleware/upload.js';
import importacionValidation from '../validations/importacion.validation.js';
import ImportacionController from '../controllers/ImportacionController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Importación
 *   description: Importación de archivos Excel
 */

/**
 * @swagger
 * /importacion:
 *   get:
 *     summary: Lista todas las importaciones
 *     tags: [Importación]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, PROCESANDO, PROCESADO, ERROR, PARCIAL]
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 20
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
 *         description: Lista de importaciones
 */
router.get(
  '/',
  validate(importacionValidation.listar()),
  ImportacionController.listar
);

/**
 * @swagger
 * /importacion/resumen:
 *   get:
 *     summary: Obtiene resumen de importaciones
 *     tags: [Importación]
 *     responses:
 *       200:
 *         description: Resumen de importaciones
 */
router.get('/resumen', ImportacionController.resumen);

/**
 * @swagger
 * /importacion/periodo:
 *   get:
 *     summary: Obtiene importaciones por período
 *     tags: [Importación]
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
 *         name: pagina
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Importaciones del período
 */
router.get(
  '/periodo',
  validate(importacionValidation.porPeriodo()),
  ImportacionController.porPeriodo
);

/**
 * @swagger
 * /importacion/{id}:
 *   get:
 *     summary: Obtiene una importación por ID
 *     tags: [Importación]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos de la importación
 *       404:
 *         description: Importación no encontrada
 */
router.get(
  '/:id',
  validate(importacionValidation.obtenerPorId()),
  ImportacionController.obtener
);

/**
 * @swagger
 * /importacion/{id}/errores:
 *   get:
 *     summary: Descarga reporte de errores de importación
 *     tags: [Importación]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Archivo CSV con errores
 *       404:
 *         description: No hay errores
 */
router.get(
  '/:id/errores',
  validate(importacionValidation.descargarErrores()),
  ImportacionController.descargarErrores
);

/**
 * @swagger
 * /importacion:
 *   post:
 *     summary: Importa un archivo Excel
 *     tags: [Importación]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Archivo importado correctamente
 *       400:
 *         description: Error en la importación
 */
router.post(
  '/',
  upload.single('archivo'),
  handleUploadErrors,
  validateFileExists,
  validate(importacionValidation.importar()),
  ImportacionController.importar
);

/**
 * @swagger
 * /importacion/validar:
 *   post:
 *     summary: Valida la estructura de un archivo Excel sin importar
 *     tags: [Importación]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Resultado de la validación
 */
router.post(
  '/validar',
  upload.single('archivo'),
  handleUploadErrors,
  validateFileExists,
  validate(importacionValidation.validarEstructura()),
  ImportacionController.validar
);

/**
 * @swagger
 * /importacion/{id}/procesar:
 *   post:
 *     summary: Procesa una importación pendiente
 *     tags: [Importación]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Importación procesada
 *       404:
 *         description: Importación no encontrada
 */
router.post(
  '/:id/procesar',
  validate(importacionValidation.procesar()),
  ImportacionController.procesar
);

/**
 * @swagger
 * /importacion/{id}/reintentar:
 *   post:
 *     summary: Reintenta registros con error
 *     tags: [Importación]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               registrosIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Reintento iniciado
 */
router.post(
  '/:id/reintentar',
  validate(importacionValidation.reintentarErrores()),
  ImportacionController.reintentar
);

/**
 * @swagger
 * /importacion/{id}:
 *   delete:
 *     summary: Elimina una importación y sus registros asociados
 *     tags: [Importación]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Importación eliminada
 *       404:
 *         description: Importación no encontrada
 */
router.delete(
  '/:id',
  validate(importacionValidation.eliminar()),
  ImportacionController.eliminar
);

export default router;