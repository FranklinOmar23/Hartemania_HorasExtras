// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de variables de entorno
dotenv.config();

// Importar configuración de Swagger
import swaggerSpec from './src/config/swagger.js';

// Importar rutas
import apiRoutes from './src/routes/api.js';

// Importar middlewares personalizados
import { requestLogger } from './src/middleware/logger.js';
import { globalLimiter } from './src/middleware/rateLimiter.js';
import errorHandler, { notFound } from './src/middleware/errorHandler.js';
import { cleanupTempFiles } from './src/middleware/upload.js';

// Importar jobs
import { iniciarJobs, detenerJobs } from './src/jobs/index.js';

// Importar utilidades
import logger from './src/utils/logger.js';
import { getConnection } from './src/config/database.js';
import { env } from './src/config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = env.PORT || 3000;

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: env.CORS.ORIGIN,
  credentials: env.CORS.CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parseo de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de peticiones (reemplaza morgan)
app.use(requestLogger);

// Rate limiting global
app.use(globalLimiter);

// Limpieza de archivos temporales (se ejecuta después de cada respuesta)
app.use(cleanupTempFiles);

// ============================================
// ARCHIVOS ESTÁTICOS
// ============================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/temp', express.static(path.join(__dirname, 'uploads/temp')));

// ============================================
// DOCUMENTACIÓN SWAGGER
// ============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Hartemania API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true
  }
}));

// Redirigir a Swagger UI
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// ============================================
// RUTAS DE LA API
// ============================================
app.use('/api/v1', apiRoutes);

// ============================================
// RUTA DE SALUD (HEALTH CHECK)
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    jobs: env.CRON.ENABLED ? 'activos' : 'inactivos',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// ============================================
// RUTA DE INFORMACIÓN DEL SISTEMA
// ============================================
app.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      nombre: 'Hartemania - Sistema de Horas Extras',
      version: process.env.npm_package_version || '1.0.0',
      ambiente: env.NODE_ENV,
      fecha: new Date().toISOString(),
      endpoints: {
        api: '/api/v1',
        documentacion: '/api-docs',
        salud: '/health'
      },
      modulos: [
        'Empleados',
        'Importación',
        'Registros Manuales',
        'Cálculos',
        'Quincenas',
        'Reportes'
      ],
      baseDeDatos: {
        servidor: env.DB.SERVER,
        base: env.DB.NAME
      }
    }
  });
});

// ============================================
// MANEJADOR DE RUTAS NO ENCONTRADAS (404)
// ============================================
app.use(notFound);

// ============================================
// MANEJADOR GLOBAL DE ERRORES
// ============================================
app.use(errorHandler);

// ============================================
// INICIO DEL SERVIDOR
// ============================================
const server = app.listen(PORT, async () => {
  try {
    // Conectar a la base de datos
    await getConnection();
    
    // Iniciar jobs programados
    if (env.CRON.ENABLED) {
      iniciarJobs();
    }
    
    logger.info('=================================');
    logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    logger.info(`📚 Documentación en http://localhost:${PORT}/api-docs`);
    logger.info(`🔄 Ambiente: ${env.NODE_ENV || 'development'}`);
    logger.info(`⏰ Jobs: ${env.CRON.ENABLED ? 'activados' : 'desactivados'}`);
    logger.info(`💾 Base de datos: ${env.DB.NAME} en ${env.DB.SERVER}`);
    logger.info('=================================');
  } catch (error) {
    logger.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
});

// ============================================
// MANEJO DE CIERRE GRACEFUL
// ============================================

// Manejar SIGTERM
process.on('SIGTERM', () => {
  logger.info('🛑 Recibida señal SIGTERM, cerrando servidor gracefulmente...');
  
  server.close(async () => {
    logger.info('✅ Servidor HTTP cerrado');
    
    // Detener jobs programados
    detenerJobs();
    
    // Cerrar conexiones de base de datos
    try {
      const { closeConnection } = await import('./src/config/database.js');
      await closeConnection();
      logger.info('✅ Conexiones de base de datos cerradas');
    } catch (err) {
      logger.error('Error cerrando base de datos:', err);
    }
    
    logger.info('✅ Servidor cerrado completamente');
    process.exit(0);
  });
  
  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    logger.error('❌ Forzando cierre del servidor');
    process.exit(1);
  }, 10000);
});

// Manejar SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  logger.info('🛑 Recibida señal SIGINT, cerrando servidor...');
  
  server.close(async () => {
    logger.info('✅ Servidor HTTP cerrado');
    
    // Detener jobs programados
    detenerJobs();
    
    // Cerrar conexiones de base de datos
    try {
      const { closeConnection } = await import('./src/config/database.js');
      await closeConnection();
      logger.info('✅ Conexiones de base de datos cerradas');
    } catch (err) {
      logger.error('Error cerrando base de datos:', err);
    }
    
    logger.info('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejar excepciones no capturadas
process.on('uncaughtException', (error) => {
  logger.error('❌ Excepción no capturada:', error);
  // En producción, podrías querer reiniciar el proceso
  if (env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Manejar promesas rechazadas no capturadas
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Promesa rechazada no capturada:', { reason, promise });
});

export default app;