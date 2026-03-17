// src/services/QuincenaService.js
import ResumenQuincenalRepository from '../repositories/ResumenQuincenalRepository.js';
import EmpleadoRepository from '../repositories/EmpleadoRepository.js';
import RegistroAsistenciaRepository from '../repositories/RegistroAsistenciaRepository.js';
import CalculoService from './CalculoService.js';
import logger from '../middleware/logger.js';
import { HTTP_STATUS, QUINCENAS } from '../utils/constants.js';
import moment from 'moment';

class QuincenaService {
  /**
   * Calcular resumen para una quincena específica
   */
  async calcularQuincena(anio, mes, quincena, usuario = 'SISTEMA') {
    try {
      // Validar quincena
      if (![1, 2].includes(parseInt(quincena))) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'La quincena debe ser 1 o 2'
        };
      }

      // Obtener fechas de la quincena
      const fechas = this._obtenerFechasQuincena(anio, mes, quincena);

      // Buscar registros pendientes en la quincena
      const registrosPendientes = await RegistroAsistenciaRepository.findSinProcesar(
        fechas.inicio,
        fechas.fin
      );

      // Calcular pendientes si existen
      if (registrosPendientes.length > 0) {
        await CalculoService.calcularPendientes(fechas.inicio, fechas.fin, usuario);
      }

      // Calcular resúmenes para todos los empleados
      const resultados = await ResumenQuincenalRepository.calcularTodos(
        anio,
        mes,
        quincena
      );

      logger.info('Quincena calculada', {
        periodo: `${anio}-${mes}-Q${quincena}`,
        empleados: resultados.length
      });

      return {
        periodo: {
          anio,
          mes,
          quincena,
          fechaInicio: fechas.inicio,
          fechaFin: fechas.fin
        },
        resultados
      };
    } catch (error) {
      logger.error('Error al calcular quincena', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de quincena
   */
  async obtenerResumenQuincena(anio, mes, quincena) {
    try {
      const resumenes = await ResumenQuincenalRepository.findByPeriodo(
        anio,
        mes,
        quincena,
        true
      );

      const totales = await ResumenQuincenalRepository.getTotalesPorPeriodo(
        anio,
        mes,
        quincena
      );

      const fechas = this._obtenerFechasQuincena(anio, mes, quincena);

      return {
        periodo: {
          anio,
          mes,
          quincena,
          fechaInicio: fechas.inicio,
          fechaFin: fechas.fin,
          nombre: this._getNombreQuincena(mes, quincena)
        },
        resumen: resumenes,
        totales
      };
    } catch (error) {
      logger.error('Error al obtener resumen de quincena', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de todas las quincenas de un mes
   */
  async obtenerResumenMensual(anio, mes) {
    try {
      const quincena1 = await this.obtenerResumenQuincena(anio, mes, 1);
      const quincena2 = await this.obtenerResumenQuincena(anio, mes, 2);

      const totalMensual = {
        totalEmpleados: Math.max(
          quincena1.totales?.TotalEmpleados || 0,
          quincena2.totales?.TotalEmpleados || 0
        ),
        totalHoras: (quincena1.totales?.TotalHoras || 0) + (quincena2.totales?.TotalHoras || 0),
        totalPagar: (quincena1.totales?.TotalPagar || 0) + (quincena2.totales?.TotalPagar || 0)
      };

      return {
        anio,
        mes,
        nombre: moment(`${anio}-${mes}-01`).format('MMMM YYYY'),
        quincenas: {
          primera: quincena1,
          segunda: quincena2
        },
        totalMensual
      };
    } catch (error) {
      logger.error('Error al obtener resumen mensual', error);
      throw error;
    }
  }

  /**
   * Obtener histórico de quincenas por empleado
   */
  async obtenerHistoricoEmpleado(empleadoId, limite = 12) {
    try {
      const empleado = await EmpleadoRepository.findById(empleadoId);
      
      if (!empleado) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Empleado no encontrado'
        };
      }

      const historico = await ResumenQuincenalRepository.getHistoricoEmpleado(
        empleadoId,
        limite
      );

      const resumenAnual = await ResumenQuincenalRepository.getResumenAnual(
        empleadoId,
        new Date().getFullYear()
      );

      return {
        empleado: empleado.toJSON(),
        historico,
        resumenAnual
      };
    } catch (error) {
      logger.error('Error al obtener histórico de empleado', error);
      throw error;
    }
  }

  /**
   * Obtener ranking de empleados por quincena
   */
  async obtenerRanking(anio, mes, quincena, limite = 10) {
    try {
      const ranking = await ResumenQuincenalRepository.getRanking(
        anio,
        mes,
        quincena,
        limite
      );

      return {
        periodo: `${anio}-${mes}-Q${quincena}`,
        ranking
      };
    } catch (error) {
      logger.error('Error al obtener ranking', error);
      throw error;
    }
  }

  /**
   * Recalcular quincena (borrar y recalcular)
   */
  async recalcularQuincena(anio, mes, quincena, usuario = 'SISTEMA') {
    try {
      // Eliminar resúmenes existentes
      await ResumenQuincenalRepository.deleteByPeriodo(anio, mes, quincena);

      // Recalcular
      const resultado = await this.calcularQuincena(anio, mes, quincena, usuario);

      logger.info('Quincena recalculada', {
        periodo: `${anio}-${mes}-Q${quincena}`
      });

      return resultado;
    } catch (error) {
      logger.error('Error al recalcular quincena', error);
      throw error;
    }
  }

  /**
   * Obtener fechas de quincena
   */
  _obtenerFechasQuincena(anio, mes, quincena) {
    if (quincena === 1) {
      return {
        inicio: moment(`${anio}-${mes}-01`).format('YYYY-MM-DD'),
        fin: moment(`${anio}-${mes}-15`).format('YYYY-MM-DD')
      };
    } else {
      const ultimoDia = moment(`${anio}-${mes}-01`).endOf('month').date();
      return {
        inicio: moment(`${anio}-${mes}-16`).format('YYYY-MM-DD'),
        fin: moment(`${anio}-${mes}-${ultimoDia}`).format('YYYY-MM-DD')
      };
    }
  }

  /**
   * Obtener nombre de quincena
   */
  _getNombreQuincena(mes, quincena) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const nombreMes = meses[mes - 1];
    return quincena === 1 
      ? `Primera quincena de ${nombreMes}`
      : `Segunda quincena de ${nombreMes}`;
  }
}

export default new QuincenaService();