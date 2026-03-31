// src/routes/registros.routes.js
import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import registroManualValidation from '../validations/registroManual.validation.js';
import RegistroManualController from '../controllers/RegistroManualController.js';

const router = Router();

router.get(
  '/',
  validate(registroManualValidation.listarTodos()),
  RegistroManualController.listarTodos
);

/**
 * @swagger
 * tags:
 *   name: Registros
 *   description: Registros de asistencia manuales
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegistroAsistencia:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         empleadoId:
 *           type: integer
 *         fecha:
 *           type: string
 *           format: date
 *         horaEntrada:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         horaSalida:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         tipoRegistro:
 *           type: string
 *           enum: [IMPORTADO, MANUAL, RELOJ]
 *         procesado:
 *           type: boolean
 */

/**
 * @swagger
 * /registros/pendientes:
 *   get:
 *     summary: Obtiene registros pendientes de procesar
 *     tags: [Registros]
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
 *     responses:
 *       200:
 *         description: Lista de registros pendientes
 */
router.get(
  '/pendientes',
  validate(registroManualValidation.pendientes()),
  RegistroManualController.pendientes
);

/**
 * @swagger
 * /registros/existe:
 *   get:
 *     summary: Verifica si existe un registro para un empleado en una fecha
 *     tags: [Registros]
 *     parameters:
 *       - in: query
 *         name: empleadoId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 */
router.get(
  '/existe',
  validate(registroManualValidation.verificarExistencia()),
  RegistroManualController.verificarExistencia
);

/**
 * @swagger
 * /registros/empleado/{empleadoId}:
 *   get:
 *     summary: Lista registros por empleado
 *     tags: [Registros]
 *     parameters:
 *       - in: path
 *         name: empleadoId
 *         required: true
 *         schema:
 *           type: integer
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
 *       - in: query
 *         name: procesado
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de registros del empleado
 */
router.get(
  '/empleado/:empleadoId',
  validate(registroManualValidation.listarPorEmpleado()),
  RegistroManualController.listarPorEmpleado
);

/**
 * @swagger
 * /registros/estadisticas/{empleadoId}:
 *   get:
 *     summary: Obtiene estadísticas de registros por empleado
 *     tags: [Registros]
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
 *     responses:
 *       200:
 *         description: Estadísticas del empleado
 */
router.get(
  '/estadisticas/:empleadoId',
  validate(registroManualValidation.estadisticas()),
  RegistroManualController.estadisticas
);

/**
 * @swagger
 * /registros/{id}:
 *   get:
 *     summary: Obtiene un registro por ID
 *     tags: [Registros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: incluirCalculos
 *         schema:
 *           type: boolean
 *         description: Incluir cálculos de horas extras
 *     responses:
 *       200:
 *         description: Datos del registro
 *       404:
 *         description: Registro no encontrado
 */
router.get(
  '/:id',
  validate(registroManualValidation.obtenerPorId()),
  RegistroManualController.obtener
);

/**
 * @swagger
 * /registros/manual:
 *   post:
 *     summary: Crea un registro manual de asistencia
 *     tags: [Registros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - empleadoId
 *               - fecha
 *             properties:
 *               empleadoId:
 *                 type: integer
 *                 example: 1
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-24"
 *               horaEntrada:
 *                 type: string
 *                 example: "08:30"
 *               horaSalida:
 *                 type: string
 *                 example: "18:45"
 *               comentarios:
 *                 type: string
 *                 example: "Trabajo extra"
 *     responses:
 *       201:
 *         description: Registro creado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/manual',
  validate(registroManualValidation.crear()),
  RegistroManualController.crear
);

/**
 * @swagger
 * /registros/entrada:
 *   post:
 *     summary: Marca la entrada de un empleado
 *     tags: [Registros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - empleadoId
 *             properties:
 *               empleadoId:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *               horaEntrada:
 *                 type: string
 *                 example: "08:30"
 *     responses:
 *       201:
 *         description: Entrada marcada correctamente
 */
router.post(
  '/entrada',
  validate(registroManualValidation.marcarEntrada()),
  RegistroManualController.marcarEntrada
);

/**
 * @swagger
 * /registros/salida:
 *   post:
 *     summary: Marca la salida de un empleado
 *     tags: [Registros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - empleadoId
 *             properties:
 *               empleadoId:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *               horaSalida:
 *                 type: string
 *                 example: "18:45"
 *     responses:
 *       200:
 *         description: Salida marcada correctamente
 */
router.post(
  '/salida',
  validate(registroManualValidation.marcarSalida()),
  RegistroManualController.marcarSalida
);

/**
 * @swagger
 * /registros/masivo:
 *   post:
 *     summary: Crea múltiples registros manuales
 *     tags: [Registros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registros
 *             properties:
 *               registros:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - empleadoId
 *                     - fecha
 *                   properties:
 *                     empleadoId:
 *                       type: integer
 *                     fecha:
 *                       type: string
 *                       format: date
 *                     horaEntrada:
 *                       type: string
 *                     horaSalida:
 *                       type: string
 *     responses:
 *       201:
 *         description: Registros creados
 */
router.post(
  '/masivo',
  validate(registroManualValidation.crearMasivo()),
  RegistroManualController.crearMasivo
);

/**
 * @swagger
 * /registros/manual/{id}:
 *   put:
 *     summary: Actualiza un registro manual
 *     tags: [Registros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               horaEntrada:
 *                 type: string
 *               horaSalida:
 *                 type: string
 *               comentarios:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registro actualizado
 *       404:
 *         description: Registro no encontrado
 */
router.put(
  '/manual/:id',
  validate(registroManualValidation.actualizar()),
  RegistroManualController.actualizar
);

/**
 * @swagger
 * /registros/manual/{id}:
 *   delete:
 *     summary: Elimina un registro manual
 *     tags: [Registros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registro eliminado
 *       404:
 *         description: Registro no encontrado
 */
router.delete(
  '/manual/:id',
  validate(registroManualValidation.eliminar()),
  RegistroManualController.eliminar
);

export default router;