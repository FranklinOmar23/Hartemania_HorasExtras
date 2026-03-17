// src/jobs/limpieza.job.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import dateHelpers from '../utils/dateHelpers.js';
import { env } from '../config/environment.js';
import RegistroAsistenciaRepository from '../repositories/RegistroAsistenciaRepository.js';
import ImportacionRepository from '../repositories/ImportacionRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LimpiezaJob {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.tempDir = path.join(this.uploadDir, 'temp');
    this.logsDir = path.join(__dirname, '../../logs');
  }

  /**
   * Ejecutar limpieza general
   */
  async ejecutar() {
    const startTime = Date.now();
    const fechaEjecucion = dateHelpers.getToday();
    
    try {
      logger.info('🧹 Iniciando tarea de limpieza', { fecha: fechaEjecucion });

      const resultados = {
        archivosTemp: await this.limpiarArchivosTemporales(),
        logs: await this.rotarLogs(),
        registrosAntiguos: await this.limpiarRegistrosAntiguos(),
        importaciones: await this.limpiarImportacionesFallidas()
      };

      const duration = Date.now() - startTime;

      logger.info('✅ Limpieza completada', {
        fecha: fechaEjecucion,
        ...resultados,
        duracion: `${duration}ms`
      });

      return {
        success: true,
        fecha: fechaEjecucion,
        ...resultados,
        duracion
      };
    } catch (error) {
      logger.error('❌ Error en tarea de limpieza', {
        error: error.message,
        fecha: fechaEjecucion,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Limpiar archivos temporales
   */
  async limpiarArchivosTemporales() {
    try {
      if (!fs.existsSync(this.tempDir)) {
        return { eliminados: 0, espacio: 0 };
      }

      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const maxAge = env.UPLOAD.TEMP_RETENTION_HOURS * 60 * 60 * 1000; // horas a ms
      
      let eliminados = 0;
      let espacioLiberado = 0;

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtimeMs;

        // Eliminar archivos más antiguos que el tiempo de retención
        if (fileAge > maxAge) {
          const fileSize = stats.size;
          fs.unlinkSync(filePath);
          eliminados++;
          espacioLiberado += fileSize;
          
          logger.debug('Archivo temporal eliminado', {
            archivo: file,
            edad: Math.round(fileAge / (60 * 60 * 1000)) + ' horas',
            tamaño: this._formatBytes(fileSize)
          });
        }
      }

      logger.info('🗑️ Archivos temporales limpiados', {
        eliminados,
        espacioLiberado: this._formatBytes(espacioLiberado)
      });

      return { eliminados, espacioLiberado };
    } catch (error) {
      logger.error('Error limpiando archivos temporales', error);
      return { eliminados: 0, espacio: 0, error: error.message };
    }
  }

  /**
   * Rotar logs antiguos
   */
  async rotarLogs() {
    try {
      if (!fs.existsSync(this.logsDir)) {
        return { rotados: 0 };
      }

      const files = fs.readdirSync(this.logsDir);
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
      
      let rotados = 0;

      for (const file of files) {
        // Solo rotar archivos .log
        if (!file.endsWith('.log')) continue;

        const filePath = path.join(this.logsDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtimeMs;

        // Comprimir logs antiguos (mayores a 7 días)
        if (fileAge > 7 * 24 * 60 * 60 * 1000 && !file.endsWith('.gz')) {
          // Aquí se podría implementar compresión gzip
          logger.debug('Log antiguo detectado', { archivo: file, edad: fileAge });
          rotados++;
        }

        // Eliminar logs muy antiguos (mayores a 30 días)
        if (fileAge > maxAge) {
          fs.unlinkSync(filePath);
          rotados++;
          logger.debug('Log eliminado', { archivo: file });
        }
      }

      logger.info('📋 Logs rotados', { rotados });

      return { rotados };
    } catch (error) {
      logger.error('Error rotando logs', error);
      return { rotados: 0, error: error.message };
    }
  }

  /**
   * Limpiar registros de asistencia muy antiguos
   */
  async limpiarRegistrosAntiguos() {
    try {
      const fechaLimite = new Date();
      fechaLimite.setFullYear(fechaLimite.getFullYear() - 2); // Mantener 2 años
      const fechaStr = dateHelpers.formatDate(fechaLimite);

      // Buscar registros anteriores a la fecha límite
      const registrosAntiguos = await RegistroAsistenciaRepository.findAll(
        'Fecha < @Fecha',
        { Fecha: fechaStr },
        1,
        1000
      );

      if (registrosAntiguos.total === 0) {
        return { eliminados: 0 };
      }

      // Opcional: Mover a tabla de histórico antes de eliminar
      // Por ahora solo contamos cuántos hay
      
      logger.info('📊 Registros antiguos encontrados', {
        cantidad: registrosAntiguos.total,
        fechaLimite: fechaStr
      });

      // No eliminamos automáticamente, solo reportamos
      return {
        pendientes: registrosAntiguos.total,
        fechaLimite: fechaStr
      };
    } catch (error) {
      logger.error('Error limpiando registros antiguos', error);
      return { eliminados: 0, error: error.message };
    }
  }

  /**
   * Limpiar importaciones fallidas antiguas
   */
  async limpiarImportacionesFallidas() {
    try {
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() - 3); // 3 meses
      const fechaStr = dateHelpers.formatDate(fechaLimite);

      // Buscar importaciones fallidas antiguas
      const importaciones = await ImportacionRepository.findAll(
        'Estado = @Estado AND FechaImportacion < @Fecha',
        { 
          Estado: 'ERROR',
          Fecha: fechaStr
        },
        1,
        100
      );

      if (importaciones.total === 0) {
        return { eliminadas: 0 };
      }

      // Eliminar importaciones fallidas
      let eliminadas = 0;
      for (const imp of importaciones.data) {
        try {
          await ImportacionRepository.eliminarConRegistros(imp.Id);
          eliminadas++;
        } catch (err) {
          logger.error('Error eliminando importación', { id: imp.Id, error: err.message });
        }
      }

      logger.info('🗑️ Importaciones fallidas eliminadas', { eliminadas });

      return { eliminadas };
    } catch (error) {
      logger.error('Error limpiando importaciones', error);
      return { eliminadas: 0, error: error.message };
    }
  }

  /**
   * Limpiar archivos de una importación específica
   */
  async limpiarArchivosImportacion(importacionId) {
    try {
      const importacionDir = path.join(this.uploadDir, 'excels');
      if (!fs.existsSync(importacionDir)) {
        return { eliminados: 0 };
      }

      const files = fs.readdirSync(importacionDir);
      let eliminados = 0;

      for (const file of files) {
        // Buscar archivos relacionados con la importación
        if (file.includes(importacionId.toString())) {
          const filePath = path.join(importacionDir, file);
          fs.unlinkSync(filePath);
          eliminados++;
          logger.debug('Archivo de importación eliminado', { archivo: file });
        }
      }

      return { eliminados };
    } catch (error) {
      logger.error('Error limpiando archivos de importación', error);
      return { eliminados: 0, error: error.message };
    }
  }

  /**
   * Formatear bytes a unidad legible
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Ejecutar limpieza de emergencia (cuando el disco está lleno)
   */
  async limpiezaEmergencia() {
    logger.warn('⚠️ Ejecutando limpieza de emergencia');
    
    const resultados = await this.ejecutar();
    
    // Limpieza más agresiva
    try {
      // Eliminar todos los archivos temporales sin importar edad
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        for (const file of files) {
          fs.unlinkSync(path.join(this.tempDir, file));
        }
        resultados.archivosTemp.eliminados += files.length;
      }

      // Comprimir logs
      // ... lógica de compresión
      
    } catch (error) {
      logger.error('Error en limpieza de emergencia', error);
    }

    return resultados;
  }
}

export default new LimpiezaJob();