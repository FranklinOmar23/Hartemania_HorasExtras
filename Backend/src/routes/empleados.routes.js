// src/routes/empleados.routes.js
import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import empleadoValidation from '../validations/empleado.validation.js';
import EmpleadoController from '../controllers/EmpleadoController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Empleados
 *   description: CRUD de empleados
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Empleado:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         codigo:
 *           type: string
 *           example: "40"
 *         nombre:
 *           type: string
 *           example: "SERGIO CRISTIAN"
 *         apellido:
 *           type: string
 *           example: "TAVERAS PINTO"
 *         posicion:
 *           type: string
 *           example: "COORDINADOR DE TALLER"
 *         departamento:
 *           type: string
 *           example: "Taller"
 *         salarioBase:
 *           type: number
 *           example: 65000
 *         fechaIngreso:
 *           type: string
 *           format: date
 *           example: "2020-01-15"
 *         tipoJornada:
 *           type: string
 *           enum: [DIURNA, NOCTURNA, MIXTA]
 *         activo:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /empleados:
 *   get:
 *     summary: Lista todos los empleados
 *     tags: [Empleados]
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por empleados activos (true) o inactivos (false)
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de registros por página
 *       - in: query
 *         name: departamento
 *         schema:
 *           type: string
 *         description: Filtrar por departamento
 *       - in: query
 *         name: tipoJornada
 *         schema:
 *           type: string
 *           enum: [DIURNA, NOCTURNA, MIXTA]
 *         description: Filtrar por tipo de jornada
 *     responses:
 *       200:
 *         description: Lista de empleados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Empleado'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get(
  '/',
  validate(empleadoValidation.listar()),
  EmpleadoController.listar
);

/**
 * @swagger
 * /empleados/buscar:
 *   get:
 *     summary: Busca empleados por nombre, apellido o código
 *     tags: [Empleados]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
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
 *         description: Resultados de la búsqueda
 *       400:
 *         description: Término de búsqueda requerido
 */
router.get(
  '/buscar',
  validate(empleadoValidation.buscar()),
  EmpleadoController.buscar
);

/**
 * @swagger
 * /empleados/estadisticas:
 *   get:
 *     summary: Obtiene estadísticas de empleados
 *     tags: [Empleados]
 *     responses:
 *       200:
 *         description: Estadísticas de empleados
 */
router.get('/estadisticas', EmpleadoController.estadisticas);

/**
 * @swagger
 * /empleados/exportar:
 *   get:
 *     summary: Exporta empleados a CSV o JSON
 *     tags: [Empleados]
 *     parameters:
 *       - in: query
 *         name: formato
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: csv
 *     responses:
 *       200:
 *         description: Archivo exportado
 */
router.get('/exportar', EmpleadoController.exportar);

/**
 * @swagger
 * /empleados/codigo/{codigo}:
 *   get:
 *     summary: Obtiene un empleado por su código
 *     tags: [Empleados]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código del empleado
 *     responses:
 *       200:
 *         description: Datos del empleado
 *       404:
 *         description: Empleado no encontrado
 */
router.get(
  '/codigo/:codigo',
  validate(empleadoValidation.obtenerPorCodigo()),
  EmpleadoController.obtenerPorCodigo
);

/**
 * @swagger
 * /empleados/{id}:
 *   get:
 *     summary: Obtiene un empleado por ID
 *     tags: [Empleados]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del empleado
 *     responses:
 *       200:
 *         description: Datos del empleado
 *       404:
 *         description: Empleado no encontrado
 */
router.get(
  '/:id',
  validate(empleadoValidation.obtenerPorId()),
  EmpleadoController.obtener
);

/**
 * @swagger
 * /empleados:
 *   post:
 *     summary: Crea un nuevo empleado
 *     tags: [Empleados]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - nombre
 *               - apellido
 *               - salarioBase
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: "45"
 *               nombre:
 *                 type: string
 *                 example: "JUAN"
 *               apellido:
 *                 type: string
 *                 example: "PEREZ"
 *               posicion:
 *                 type: string
 *                 example: "AUXILIAR DE TALLER"
 *               departamento:
 *                 type: string
 *                 example: "Taller"
 *               salarioBase:
 *                 type: number
 *                 example: 27489.6
 *               fechaIngreso:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-15"
 *               tipoJornada:
 *                 type: string
 *                 enum: [DIURNA, NOCTURNA, MIXTA]
 *                 default: "DIURNA"
 *     responses:
 *       201:
 *         description: Empleado creado exitosamente
 *       400:
 *         description: Datos inválidos o código duplicado
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/',
  validate(empleadoValidation.crear()),
  EmpleadoController.crear
);

/**
 * @swagger
 * /empleados/salarios-masivo:
 *   post:
 *     summary: Actualiza salarios de múltiples empleados
 *     tags: [Empleados]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - empleadosIds
 *               - nuevoSalario
 *             properties:
 *               empleadosIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               nuevoSalario:
 *                 type: number
 *                 example: 30000
 *     responses:
 *       200:
 *         description: Salarios actualizados
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/salarios-masivo',
  validate(empleadoValidation.actualizarSalariosMasivo()),
  EmpleadoController.actualizarSalariosMasivo
);

/**
 * @swagger
 * /empleados/{id}:
 *   put:
 *     summary: Actualiza un empleado existente
 *     tags: [Empleados]
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
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               posicion:
 *                 type: string
 *               salarioBase:
 *                 type: number
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Empleado actualizado
 *       404:
 *         description: Empleado no encontrado
 */
router.put(
  '/:id',
  validate(empleadoValidation.actualizar()),
  EmpleadoController.actualizar
);

/**
 * @swagger
 * /empleados/{id}:
 *   delete:
 *     summary: Elimina un empleado (soft delete)
 *     tags: [Empleados]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empleado eliminado correctamente
 *       404:
 *         description: Empleado no encontrado
 */
router.delete(
  '/:id',
  validate(empleadoValidation.eliminar()),
  EmpleadoController.eliminar
);

/**
 * @swagger
 * /empleados/todos:
 *   get:
 *     summary: Obtiene todos los empleados activos
 *     tags: [Empleados]
 *     responses:
 *       200:
 *         description: Lista de empleados activos
 */
router.get('/todos', EmpleadoController.obtenerTodosActivos);

export default router;