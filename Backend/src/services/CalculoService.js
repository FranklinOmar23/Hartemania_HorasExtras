// src/services/CalculoService.js
import RegistroAsistenciaRepository from '../repositories/RegistroAsistenciaRepository.js';
import EmpleadoRepository from '../repositories/EmpleadoRepository.js';
import TipoHoraExtraRepository from '../repositories/TipoHoraExtraRepository.js';
import ResumenQuincenalRepository from '../repositories/ResumenQuincenalRepository.js'; // ✅ AGREGADO
import FeriadoService from './FeriadoService.js';
import logger from '../middleware/logger.js';
import { HTTP_STATUS, HORARIOS_DEFAULT, TIPOS_HORAS_EXTRAS } from '../utils/constants.js';

// ✅ IMPORTACIONES FALTANTES
import { getConnection, TYPES } from '../config/database.js'; 

class CalculoService {
  /**
   * Calcular horas extras para un registro
   */
  async calcularHorasExtras(registroId, usuario = 'SISTEMA') {
    try {
      // Obtener registro con empleado
      const registro = await RegistroAsistenciaRepository.findById(registroId);
      if (!registro) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Registro no encontrado'
        };
      }

      // Validar que tenga horas
      if (!registro.HoraEntrada || !registro.HoraSalida) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'El registro no tiene horas completas'
        };
      }

      // Validar que las horas sean strings válidos
      if (typeof registro.HoraEntrada !== 'string' || typeof registro.HoraSalida !== 'string') {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: `Formato de hora inválido: entrada=${typeof registro.HoraEntrada}, salida=${typeof registro.HoraSalida}`
        };
      }

      const empleado = await EmpleadoRepository.findById(registro.EmpleadoId);
      if (!empleado) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Empleado no encontrado'
        };
      }

      // Verificar si es feriado
      const feriado = await FeriadoService.esFeriado(registro.Fecha);
      const esFeriado = feriado.esFeriado;

      // Determinar tipo de día
      const diaSemana = new Date(registro.Fecha).getDay();
      const esFinSemana = diaSemana === 0 || diaSemana === 6;

      // Calcular horas trabajadas
      const horasTrabajadas = this._calcularHorasTrabajadas(
        registro.HoraEntrada,
        registro.HoraSalida
      );

      // Calcular horas base según jornada
      const horasBase = this._obtenerHorasBase(diaSemana, esFeriado);

      // Calcular horas extras
      const resultado = this._calcularHorasExtrasPorTipo(
        registro.HoraEntrada,
        registro.HoraSalida,
        horasBase,
        esFinSemana,
        esFeriado
      );

      // Obtener tipos de horas extras
      const tiposHE = await TipoHoraExtraRepository.findAll('Activo = 1', {}, 1, 10);

      // Calcular montos
      const valorHora = empleado.SalarioPorHora;
      const calculos = [];

      for (const [tipo, horas] of Object.entries(resultado)) {
        if (horas > 0) {
          const tipoHE = tiposHE.data.find(t => {
            if (tipo === '35%' && t.Codigo === '35%') return true;
            if (tipo === '100%' && (t.Codigo === '100%' || t.Codigo === 'FERIADO')) return true;
            if (tipo === '15%' && t.Codigo === '15%') return true;
            return false;
          });

          if (tipoHE) {
            const monto = horas * valorHora * tipoHE.FactorMultiplicador;
            
            // Guardar cálculo
            const calculo = await this._guardarCalculo(
              registro.Id,
              tipoHE.Id,
              horas,
              valorHora,
              monto,
              usuario
            );
            
            calculos.push(calculo);
          }
        }
      }

      // Marcar registro como procesado
      if (calculos.length > 0) {
        await RegistroAsistenciaRepository.update(registroId, {
          Procesado: 1,
          FechaProcesado: new Date()
        });
      }

      logger.info('Horas extras calculadas', {
        registroId,
        empleadoId: empleado.Id,
        totalHoras: resultado.total,
        totalCalculos: calculos.length
      });

      return {
        registro: registro.toJSON(),
        empleado: empleado.toJSON(),
        calculos,
        resumen: resultado
      };
    } catch (error) {
      logger.error('Error al calcular horas extras', error);
      throw error;
    }
  }

  /**
   * Guardar cálculo en la base de datos
   */
  async _guardarCalculo(registroId, tipoHEId, horas, valorHora, monto, usuario) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('RegistroId', TYPES.Int, registroId)
        .input('TipoHEId', TYPES.Int, tipoHEId)
        .input('Horas', TYPES.Decimal(10,2), horas)
        .input('ValorHora', TYPES.Decimal(10,2), valorHora)
        .input('Monto', TYPES.Decimal(10,2), monto)
        .input('Usuario', TYPES.NVarChar, usuario)
        .query(`
          INSERT INTO CalculosHorasExtras (
            RegistroAsistenciaId, TipoHEId, Horas, ValorHora, Monto, UsuarioCalculo
          )
          OUTPUT INSERTED.*
          VALUES (@RegistroId, @TipoHEId, @Horas, @ValorHora, @Monto, @Usuario)
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Error al guardar cálculo: ${error.message}`);
    }
  }

  /**
   * Calcular horas extras para múltiples registros
   */
  async calcularHorasExtrasMasivo(registrosIds, usuario = 'SISTEMA') {
    const resultados = [];
    const errores = [];

    for (const id of registrosIds) {
      try {
        const resultado = await this.calcularHorasExtras(id, usuario);
        resultados.push(resultado);
      } catch (error) {
        errores.push({
          registroId: id,
          error: error.message
        });
      }
    }

    logger.info('Cálculo masivo completado', {
      exitosos: resultados.length,
      errores: errores.length
    });

    return {
      exitosos: resultados,
      errores
    };
  }

  /**
   * Calcular horas extras para todos los registros pendientes de un período
   */
  async calcularPendientes(fechaInicio, fechaFin, usuario = 'SISTEMA') {
    try {
      const registros = await RegistroAsistenciaRepository.findSinProcesar(
        fechaInicio,
        fechaFin
      );

      const registrosIds = registros.map(r => r.Id);
      
      if (registrosIds.length === 0) {
        return {
          message: 'No hay registros pendientes en el período',
          total: 0
        };
      }

      const resultado = await this.calcularHorasExtrasMasivo(registrosIds, usuario);

      return {
        ...resultado,
        total: registrosIds.length
      };
    } catch (error) {
      logger.error('Error al calcular pendientes', error);
      throw error;
    }
  }

  /**
   * Calcular horas trabajadas
   */
  _calcularHorasTrabajadas(entrada, salida) {
    // Validar que sean strings
    if (typeof entrada !== 'string' || typeof salida !== 'string') {
      return 0;
    }

    const [hEnt, mEnt] = entrada.split(':').map(Number);
    const [hSal, mSal] = salida.split(':').map(Number);
    
    // Validar que sean números válidos
    if (isNaN(hEnt) || isNaN(mEnt) || isNaN(hSal) || isNaN(mSal)) {
      return 0;
    }
    
    let minutosEntrada = hEnt * 60 + mEnt;
    let minutosSalida = hSal * 60 + mSal;
    
    // Si cruza medianoche
    if (minutosSalida < minutosEntrada) {
      minutosSalida += 24 * 60;
    }
    
    const minutosTrabajados = minutosSalida - minutosEntrada;
    return minutosTrabajados / 60;
  }

  /**
   * Obtener horas base según día
   */
  _obtenerHorasBase(diaSemana, esFeriado) {
    if (esFeriado) return 0;
    
    if (diaSemana === 0) return 0; // Domingo
    if (diaSemana === 6) return 4; // Sábado (4 horas)
    return 8; // Lunes a Viernes (8 horas)
  }

  /**
   * Calcular horas extras por tipo
   */
  _calcularHorasExtrasPorTipo(entrada, salida, horasBase, esFinSemana, esFeriado) {
    const resultado = {
      '35%': 0,
      '100%': 0,
      '15%': 0,
      total: 0
    };

    // Validar horas
    if (typeof entrada !== 'string' || typeof salida !== 'string') {
      return resultado;
    }

    // Si es feriado, todo es 100%
    if (esFeriado) {
      const horas = this._calcularHorasTrabajadas(entrada, salida);
      resultado['100%'] = horas;
      resultado.total = horas;
      return resultado;
    }

    // Si es fin de semana, todo es 100%
    if (esFinSemana) {
      const horas = this._calcularHorasTrabajadas(entrada, salida);
      resultado['100%'] = horas;
      resultado.total = horas;
      return resultado;
    }

    // Días de semana - calcular según horario
    try {
      const [hEnt, mEnt] = entrada.split(':').map(Number);
      const [hSal, mSal] = salida.split(':').map(Number);
      
      if (isNaN(hEnt) || isNaN(mEnt) || isNaN(hSal) || isNaN(mSal)) {
        return resultado;
      }
      
      const minutosEntrada = hEnt * 60 + mEnt;
      const minutosSalida = hSal * 60 + mSal;
      
      const horarioNormalSalida = this._horaToMinutos(HORARIOS_DEFAULT.SEMANA.salida);
      const inicioNocturno = this._horaToMinutos(HORARIOS_DEFAULT.NOCTURNO.inicio);

      // Horas extras diurnas (35%)
      if (minutosSalida > horarioNormalSalida) {
        let minutosExtra = minutosSalida - horarioNormalSalida;
        
        // Separar nocturnas si aplica
        if (minutosSalida > inicioNocturno) {
          const minutosNocturnos = minutosSalida - inicioNocturno;
          const minutosDiurnosExtra = minutosExtra - minutosNocturnos;
          
          resultado['35%'] = minutosDiurnosExtra / 60;
          resultado['15%'] = minutosNocturnos / 60;
        } else {
          resultado['35%'] = minutosExtra / 60;
        }
      }
    } catch (error) {
      logger.error('Error al calcular horas extras por tipo', { error, entrada, salida });
    }

    resultado.total = resultado['35%'] + resultado['100%'] + resultado['15%'];
    
    return resultado;
  }

  /**
   * Convertir hora a minutos
   */
  _horaToMinutos(hora) {
    if (typeof hora !== 'string') return 0;
    const [h, m] = hora.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }
}

export default new CalculoService();