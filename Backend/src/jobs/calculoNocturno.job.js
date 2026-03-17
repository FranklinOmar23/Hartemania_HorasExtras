// src/jobs/calculoNocturno.job.js
import logger from '../utils/logger.js';
import dateHelpers from '../utils/dateHelpers.js';
import RegistroAsistenciaRepository from '../repositories/RegistroAsistenciaRepository.js';
import CalculoService from '../services/CalculoService.js';
import QuincenaService from '../services/QuincenaService.js';

class CalculoNocturnoJob {
  /**
   * Ejecutar cálculo nocturno
   * Procesa todos los registros pendientes del día anterior
   */
  async ejecutar() {
    const startTime = Date.now();
    const fechaEjecucion = dateHelpers.getToday();
    
    try {
      logger.info('🔍 Iniciando cálculo nocturno', { fecha: fechaEjecucion });

      // Calcular fecha de ayer
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      const fechaAyer = dateHelpers.formatDate(ayer);

      // Buscar registros pendientes de ayer
      const registrosPendientes = await RegistroAsistenciaRepository.findSinProcesar(
        fechaAyer,
        fechaAyer
      );

      if (registrosPendientes.length === 0) {
        logger.info('✅ No hay registros pendientes para procesar', { fecha: fechaAyer });
        return {
          success: true,
          message: 'No hay registros pendientes',
          procesados: 0
        };
      }

      logger.info('📝 Registros pendientes encontrados', {
        cantidad: registrosPendientes.length,
        fecha: fechaAyer
      });

      // Procesar registros
      const registrosIds = registrosPendientes.map(r => r.Id);
      const resultado = await CalculoService.calcularHorasExtrasMasivo(
        registrosIds,
        'SISTEMA_CRON'
      );

      // Actualizar quincenas si es necesario
      const fecha = new Date(fechaAyer);
      const { year, month, quincena } = dateHelpers.getQuincenaRange(fecha);
      
      // Recalcular quincena afectada
      await QuincenaService.calcularQuincena(year, month, quincena, 'SISTEMA_CRON');

      const duration = Date.now() - startTime;

      logger.info('✅ Cálculo nocturno completado', {
        fecha: fechaEjecucion,
        procesados: resultado.exitosos.length,
        errores: resultado.errores.length,
        duracion: `${duration}ms`
      });

      return {
        success: true,
        fecha: fechaEjecucion,
        procesados: resultado.exitosos.length,
        errores: resultado.errores.length,
        duracion
      };
    } catch (error) {
      logger.error('❌ Error en cálculo nocturno', {
        error: error.message,
        fecha: fechaEjecucion,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Ejecutar cálculo de fin de mes
   * Procesa todos los registros pendientes del mes y recalcula quincenas
   */
  async ejecutarFinDeMes() {
    const startTime = Date.now();
    const fechaEjecucion = dateHelpers.getToday();
    
    try {
      logger.info('📅 Iniciando cálculo de fin de mes');

      const fecha = new Date();
      const anio = fecha.getFullYear();
      const mes = fecha.getMonth() + 1;

      // Procesar primera quincena si está pendiente
      logger.info('📊 Procesando primera quincena', { anio, mes });
      await QuincenaService.calcularQuincena(anio, mes, 1, 'SISTEMA_CRON');

      // Procesar segunda quincena
      logger.info('📊 Procesando segunda quincena', { anio, mes });
      await QuincenaService.calcularQuincena(anio, mes, 2, 'SISTEMA_CRON');

      // Generar resumen mensual
      const resumenMensual = await QuincenaService.obtenerResumenMensual(anio, mes);

      const duration = Date.now() - startTime;

      logger.info('✅ Cálculo de fin de mes completado', {
        anio,
        mes,
        totalEmpleados: resumenMensual.totalMensual?.totalEmpleados || 0,
        totalPagar: resumenMensual.totalMensual?.totalPagar || 0,
        duracion: `${duration}ms`
      });

      return {
        success: true,
        anio,
        mes,
        resumen: resumenMensual,
        duracion
      };
    } catch (error) {
      logger.error('❌ Error en cálculo de fin de mes', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Ejecutar cálculo para un rango de fechas específico
   */
  async ejecutarParaRango(fechaInicio, fechaFin) {
    const startTime = Date.now();
    
    try {
      logger.info('🔍 Iniciando cálculo para rango', { fechaInicio, fechaFin });

      // Buscar registros pendientes en el rango
      const registrosPendientes = await RegistroAsistenciaRepository.findSinProcesar(
        fechaInicio,
        fechaFin
      );

      if (registrosPendientes.length === 0) {
        logger.info('✅ No hay registros pendientes en el rango');
        return {
          success: true,
          message: 'No hay registros pendientes',
          procesados: 0
        };
      }

      // Procesar registros
      const registrosIds = registrosPendientes.map(r => r.Id);
      const resultado = await CalculoService.calcularHorasExtrasMasivo(
        registrosIds,
        'SISTEMA_CRON'
      );

      // Recalcular quincenas afectadas
      const fechasAfectadas = new Set();
      for (const registro of registrosPendientes) {
        const { year, month, quincena } = dateHelpers.getQuincenaRange(registro.Fecha);
        fechasAfectadas.add(`${year}-${month}-${quincena}`);
      }

      for (const fechaKey of fechasAfectadas) {
        const [anio, mes, quincena] = fechaKey.split('-').map(Number);
        await QuincenaService.calcularQuincena(anio, mes, quincena, 'SISTEMA_CRON');
      }

      const duration = Date.now() - startTime;

      logger.info('✅ Cálculo para rango completado', {
        fechaInicio,
        fechaFin,
        procesados: resultado.exitosos.length,
        errores: resultado.errores.length,
        duracion: `${duration}ms`
      });

      return {
        success: true,
        fechaInicio,
        fechaFin,
        procesados: resultado.exitosos.length,
        errores: resultado.errores.length,
        duracion
      };
    } catch (error) {
      logger.error('❌ Error en cálculo para rango', {
        error: error.message,
        fechaInicio,
        fechaFin,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Obtener estadísticas del último cálculo
   */
  async obtenerEstadisticas() {
    // Esta función podría leer de una tabla de logs de jobs
    // Por ahora retornamos un resumen simple
    return {
      ultimaEjecucion: new Date().toISOString(),
      estado: 'activo',
      jobs: [
        { nombre: 'Cálculo Nocturno', horario: '02:00', estado: 'activo' },
        { nombre: 'Fin de Mes', horario: '23:59 último día', estado: 'activo' }
      ]
    };
  }
}

export default new CalculoNocturnoJob();