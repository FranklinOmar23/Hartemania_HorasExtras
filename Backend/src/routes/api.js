// src/routes/api.js
import { Router } from 'express';
import empleadosRoutes from './empleados.routes.js';
import importacionRoutes from './importacion.routes.js';
import registrosRoutes from './registros.routes.js';
import calculosRoutes from './calculos.routes.js';
import quincenasRoutes from './quincenas.routes.js';
import reportesRoutes from './reportes.routes.js';

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Bienvenida a la API
 *     tags: [Root]
 *     responses:
 *       200:
 *         description: API funcionando
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Hartemania - Sistema de Horas Extras',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      empleados: '/api/empleados',
      importacion: '/api/importacion',
      registros: '/api/registros',
      calculos: '/api/calculos',
      quincenas: '/api/quincenas',
      reportes: '/api/reportes'
    }
  });
});

// Montar rutas específicas
router.use('/empleados', empleadosRoutes);
router.use('/importacion', importacionRoutes);
router.use('/registros', registrosRoutes);
router.use('/calculos', calculosRoutes);
router.use('/quincenas', quincenasRoutes);
router.use('/reportes', reportesRoutes);

export default router;