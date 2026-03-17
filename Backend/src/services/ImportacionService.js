// src/services/ImportacionService.js
import fs from 'fs';
import path from 'path';
import ExcelParser from '../utils/excelParser.js';
import ImportacionRepository from '../repositories/ImportacionRepository.js';
import RegistroAsistenciaRepository from '../repositories/RegistroAsistenciaRepository.js';
import EmpleadoRepository from '../repositories/EmpleadoRepository.js';
import logger from '../middleware/logger.js';
import { HTTP_STATUS, ESTADOS_IMPORTACION } from '../utils/constants.js';

class ImportacionService {
  /**
   * Procesar archivo Excel importado
   */
  async procesarArchivo(file, usuario = 'SISTEMA') {
    try {
      // Leer archivo
      const fileBuffer = fs.readFileSync(file.path);

      // Parsear Excel
      const parser = new ExcelParser();
      const resultado = await parser.parsear(fileBuffer, file.originalname);

      // Crear registro de importación
      const importacion = await ImportacionRepository.crearImportacion(
        file.originalname,
        usuario,
        resultado.registros.length
      );

      // Procesar registros
      const registrosProcesados = await this._procesarRegistros(
        importacion.Id,
        resultado.registros
      );

      // Actualizar estadísticas
      const periodoInicio = resultado.periodoInicio;
      const periodoFin = resultado.periodoFin;

      await ImportacionRepository.actualizarEstadisticas(
        importacion.Id,
        registrosProcesados.exitosos.length,
        registrosProcesados.errores.length,
        periodoInicio,
        periodoFin
      );

      // Si hay errores, marcar como parcial
      if (registrosProcesados.errores.length > 0) {
        await ImportacionRepository.cambiarEstado(
          importacion.Id,
          ESTADOS_IMPORTACION.PARCIAL,
          `Se procesaron ${registrosProcesados.exitosos.length} de ${resultado.registros.length} registros`
        );
      }

      logger.info('Archivo procesado', {
        importacionId: importacion.Id,
        archivo: file.originalname,
        exitosos: registrosProcesados.exitosos.length,
        errores: registrosProcesados.errores.length
      });

      return {
        importacion,
        registros: registrosProcesados.exitosos,
        errores: registrosProcesados.errores,
        metadatos: resultado.metadatos
      };
    } catch (error) {
      logger.error('Error al procesar archivo', error);
      throw error;
    }
  }

  /**
   * Procesar registros individuales
   */
  async _procesarRegistros(importacionId, registros) {
    const exitosos = [];
    const errores = [];

    for (const registro of registros) {
      try {
        // Buscar empleado por código
        const empleado = await EmpleadoRepository.findByCodigo(registro.codigo);

        if (!empleado) {
          throw new Error(`Empleado con código ${registro.codigo} no encontrado`);
        }

        // Verificar si ya existe registro para esa fecha
        const existe = await RegistroAsistenciaRepository.existeRegistro(
          empleado.Id,
          registro.fecha
        );

        if (existe) {
          throw new Error(`Ya existe un registro para el empleado ${registro.codigo} en la fecha ${registro.fecha}`);
        }

        // ✅ PERMITIR horas null (se asignarán valores por defecto en el repositorio)
        const nuevoRegistro = await RegistroAsistenciaRepository.create({
          EmpleadoId: empleado.Id,
          ImportacionId: importacionId,
          Fecha: registro.fecha,
          HoraEntrada: registro.horaEntrada,  // Puede ser null
          HoraSalida: registro.horaSalida,    // Puede ser null
          Comentarios: registro.comentarios,
          FilaExcel: registro.fila,
          UsuarioCreacion: 'IMPORTACION'
        });

        exitosos.push(nuevoRegistro);
      } catch (error) {
        errores.push({
          fila: registro.fila,
          codigo: registro.codigo,
          fecha: registro.fecha,
          error: error.message
        });
      }
    }

    return { exitosos, errores };
  }

  /**
   * Obtener importaciones con filtros
   */
  async listarImportaciones(filtros = {}) {
    const { estado, pagina = 1, limite = 20, fechaInicio, fechaFin } = filtros;

    try {
      let resultado;

      if (estado) {
        resultado = await ImportacionRepository.findByEstado(estado, pagina, limite);
      } else if (fechaInicio && fechaFin) {
        resultado = await ImportacionRepository.findByPeriodo(fechaInicio, fechaFin, pagina, limite);
      } else {
        resultado = await ImportacionRepository.findAll('1=1', {}, pagina, limite, 'FechaImportacion DESC');
      }

      return resultado;
    } catch (error) {
      logger.error('Error al listar importaciones', error);
      throw error;
    }
  }

  /**
   * Obtener importación por ID
   */
  async obtenerImportacionPorId(id) {
    try {
      const importacion = await ImportacionRepository.findById(id);

      if (!importacion) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Importación no encontrada'
        };
      }

      // Obtener registros asociados
      const registros = await RegistroAsistenciaRepository.findByImportacion(id);

      return {
        ...importacion.toJSON(),
        registros: registros.map(r => r.toJSON())
      };
    } catch (error) {
      logger.error('Error al obtener importación', error);
      throw error;
    }
  }

  /**
   * Procesar importación pendiente
   */
  async procesarImportacion(id) {
    try {
      const importacion = await ImportacionRepository.findById(id);

      if (!importacion) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Importación no encontrada'
        };
      }

      if (importacion.Estado !== ESTADOS_IMPORTACION.PENDIENTE) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: `La importación ya fue procesada (estado: ${importacion.Estado})`
        };
      }

      // Obtener registros pendientes
      const registros = await RegistroAsistenciaRepository.findByImportacion(id);

      // Aquí iría la lógica de cálculo automático si es necesario
      // Por ahora solo marcamos como procesada

      await ImportacionRepository.cambiarEstado(id, ESTADOS_IMPORTACION.PROCESADO);

      logger.info('Importación procesada', { importacionId: id });

      return { success: true, message: 'Importación procesada correctamente' };
    } catch (error) {
      logger.error('Error al procesar importación', error);
      throw error;
    }
  }

  /**
   * Eliminar importación
   */
  async eliminarImportacion(id) {
    try {
      const importacion = await ImportacionRepository.findById(id);

      if (!importacion) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Importación no encontrada'
        };
      }

      const resultado = await ImportacionRepository.eliminarConRegistros(id);

      logger.info('Importación eliminada', { importacionId: id });

      return resultado;
    } catch (error) {
      logger.error('Error al eliminar importación', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de importaciones
   */
  async obtenerResumen() {
    try {
      const resumen = await ImportacionRepository.getResumen();
      const estadisticasPorMes = await ImportacionRepository.getEstadisticasPorMes(new Date().getFullYear());

      return {
        totales: resumen,
        porMes: estadisticasPorMes
      };
    } catch (error) {
      logger.error('Error al obtener resumen de importaciones', error);
      throw error;
    }
  }

  /**
   * Validar estructura de Excel antes de importar
   */
  async validarEstructura(file) {
    try {
      const fileBuffer = fs.readFileSync(file.path);
      const parser = new ExcelParser();

      // Intentar parsear para validar
      const resultado = await parser.parsear(fileBuffer, file.originalname);

      return {
        valido: true,
        totalRegistros: resultado.registros.length,
        periodo: {
          inicio: resultado.periodoInicio,
          fin: resultado.periodoFin
        },
        metadatos: resultado.metadatos
      };
    } catch (error) {
      return {
        valido: false,
        error: error.message
      };
    }
  }
}

export default new ImportacionService();