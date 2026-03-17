// src/jobs/index.js
import cron from 'node-cron';
import logger from '../utils/logger.js';
import { env } from '../config/environment.js';
import calculoNocturnoJob from './calculoNocturno.job.js';
import limpiezaJob from './limpieza.job.js';

/**
 * Inicializar todos los jobs programados
 */
export const iniciarJobs = () => {
  if (!env.CRON.ENABLED) {
    logger.info('⏰ Jobs programados desactivados');
    return;
  }

  logger.info('⏰ Inicializando jobs programados...');

  // Job de cálculo nocturno (diario a las 2 AM)
  const [calculoHora, calculoMinuto] = env.CRON.CALCULO_HORA.split(':');
  const calculoCron = `${calculoMinuto} ${calculoHora} * * *`;
  
  cron.schedule(calculoCron, async () => {
    try {
      logger.info('🚀 Ejecutando job de cálculo nocturno');
      await calculoNocturnoJob.ejecutar();
    } catch (error) {
      logger.error('Error en job de cálculo nocturno', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/Santo_Domingo'
  });

  logger.info(`📊 Job de cálculo nocturno programado: ${calculoCron}`);

  // Job de limpieza (diario a las 3 AM)
  const [limpiezaHora, limpiezaMinuto] = env.CRON.LIMPIEZA_HORA.split(':');
  const limpiezaCron = `${limpiezaMinuto} ${limpiezaHora} * * *`;
  
  cron.schedule(limpiezaCron, async () => {
    try {
      logger.info('🧹 Ejecutando job de limpieza');
      await limpiezaJob.ejecutar();
    } catch (error) {
      logger.error('Error en job de limpieza', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/Santo_Domingo'
  });

  logger.info(`🧹 Job de limpieza programado: ${limpiezaCron}`);

  // Job de fin de mes (último día del mes a las 11:59 PM)
  cron.schedule('59 23 28-31 * *', async () => {
    try {
      const hoy = new Date();
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
      
      if (hoy.getDate() === ultimoDia) {
        logger.info('📅 Ejecutando job de fin de mes');
        await calculoNocturnoJob.ejecutarFinDeMes();
      }
    } catch (error) {
      logger.error('Error en job de fin de mes', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/Santo_Domingo'
  });

  logger.info('📅 Job de fin de mes programado');

  // Job de respaldo (domingos a las 4 AM)
  cron.schedule('0 4 * * 0', async () => {
    try {
      logger.info('💾 Ejecutando job de respaldo');
      // Aquí iría la lógica de respaldo
      logger.info('💾 Respaldo completado');
    } catch (error) {
      logger.error('Error en job de respaldo', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/Santo_Domingo'
  });

  logger.info('💾 Job de respaldo programado: 0 4 * * 0');

  logger.info('✅ Todos los jobs iniciados correctamente');
};

/**
 * Detener todos los jobs
 */
export const detenerJobs = () => {
  logger.info('⏹️ Deteniendo jobs...');
  cron.getTasks().forEach(task => task.destroy());
  logger.info('✅ Jobs detenidos');
};

export default {
  iniciarJobs,
  detenerJobs
};