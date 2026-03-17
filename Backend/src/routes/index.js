// src/routes/index.js
import { Router } from 'express';
import apiRoutes from './api.js';

const router = Router();

// Montar todas las rutas bajo /api
router.use('/api', apiRoutes);

// Ruta de salud
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

export default router;