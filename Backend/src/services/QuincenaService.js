// src/services/QuincenaService.js
import ResumenQuincenalRepository from '../repositories/ResumenQuincenalRepository.js';
import EmpleadoRepository from '../repositories/EmpleadoRepository.js';
import RegistroAsistenciaRepository from '../repositories/RegistroAsistenciaRepository.js';
import FeriadoService from './FeriadoService.js';
import logger from '../middleware/logger.js';
import { HTTP_STATUS, HORARIOS_DEFAULT } from '../utils/constants.js';
import moment from 'moment';

class QuincenaService {
  /**
   * Calcular resumen para una quincena específica
   */
  async calcularQuincena(anio, mes, quincena, usuario = 'SISTEMA') {
    try {
      if (![1, 2].includes(parseInt(quincena))) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'La quincena debe ser 1 o 2'
        };
      }

      const fechas = this._obtenerFechasQuincena(anio, mes, quincena);

      // Obtener todos los registros del periodo
      const registros = await RegistroAsistenciaRepository.findByRangoFechas(
        fechas.inicio,
        fechas.fin
      );

      // Diagnostico: total registros encontrados
      const fechasEncontradas = [...new Set(registros.map(r => {
        const f = r.Fecha;
        return f instanceof Date ? f.toISOString().substring(0,10) : String(f).substring(0,10);
      }))].sort();
      console.log(`📊 BD retorno ${registros.length} registros para ${fechas.inicio} a ${fechas.fin}`);
      console.log(`📅 Fechas en BD: ${fechasEncontradas.join(', ')}`);

      // Obtener todos los empleados activos
      const empleadosResult = await EmpleadoRepository.findActivos(1, 1000);
      const empleados = empleadosResult.data;

      // Agrupar registros por empleado
      const registrosPorEmpleado = {};
      for (const reg of registros) {
        if (!registrosPorEmpleado[reg.EmpleadoId]) {
          registrosPorEmpleado[reg.EmpleadoId] = [];
        }
        registrosPorEmpleado[reg.EmpleadoId].push(reg);
      }

      // Eliminar resumenes anteriores del periodo
      await ResumenQuincenalRepository.deleteByPeriodo(
        parseInt(anio),
        parseInt(mes),
        parseInt(quincena)
      );

      // Calcular y guardar resumen por empleado
      const resultados = [];
      for (const empleado of empleados) {
        const regs = registrosPorEmpleado[empleado.Id] || [];
        if (regs.length === 0) continue;

        const resumenData = {
          Horas35: 0, Horas100: 0, Horas15: 0, HorasFeriado: 0,
          Monto35: 0, Monto100: 0, Monto15: 0, MontoFeriado: 0
        };

        const valorHora = empleado.SalarioPorHora || 0;

        for (const reg of regs) {
          if (!reg.HoraEntrada || !reg.HoraSalida) continue;

          const fecha = reg.Fecha;
          const feriado = await FeriadoService.esFeriado(fecha);
          const esFeriado = feriado.esFeriado;
          // Usar moment.utc para evitar desfase de timezone en getDay()
          const diaSemana = moment.utc(fecha).day();

          const extras = this._calcularExtras(
            reg.HoraEntrada, reg.HoraSalida,
            diaSemana, esFeriado
          );

          // Log diagnostico por registro
          const diasNombres = ['DOM','LUN','MAR','MIE','JUE','VIE','SAB'];
          const fechaStr = moment.utc(fecha).format('YYYY-MM-DD');
          console.log(`  [${fechaStr} ${diasNombres[diaSemana]}] ${reg.HoraEntrada}-${reg.HoraSalida} | HE35=${extras.horas35.toFixed(2)} HE100=${extras.horas100.toFixed(2)} HE15=${extras.horas15.toFixed(2)} FER=${extras.horasFeriado.toFixed(2)}${esFeriado ? ' (FERIADO)' : ''}`);

          // Acumular horas y montos por categoria
          resumenData.Horas35 += extras.horas35;
          resumenData.Monto35 += extras.horas35 * valorHora * 1.35;

          resumenData.Horas100 += extras.horas100;
          resumenData.Monto100 += extras.horas100 * valorHora * 2.0;

          // NOCT 15% es recargo ADICIONAL (no excluyente con 35%/100%)
          resumenData.Horas15 += extras.horas15;
          resumenData.Monto15 += extras.horas15 * valorHora * 0.15;

          resumenData.HorasFeriado += extras.horasFeriado;
          resumenData.MontoFeriado += extras.horasFeriado * valorHora * 2.0;
        }

        // Horas15 no se suma a totalHoras porque ya esta incluida en 35%/100%/feriado
        const totalHoras = resumenData.Horas35 + resumenData.Horas100 +
                           resumenData.HorasFeriado;
        const totalPagar = resumenData.Monto35 + resumenData.Monto100 +
                           resumenData.Monto15 + resumenData.MontoFeriado;

        console.log(`=== RESUMEN ${empleado.Nombre || empleado.Id} (${regs.length} registros) ===`);
        console.log(`  HE35=${resumenData.Horas35.toFixed(2)}h  HE100=${resumenData.Horas100.toFixed(2)}h  HE15=${resumenData.Horas15.toFixed(2)}h  FER=${resumenData.HorasFeriado.toFixed(2)}h`);
        console.log(`  M35=$${resumenData.Monto35.toFixed(2)}  M100=$${resumenData.Monto100.toFixed(2)}  M15=$${resumenData.Monto15.toFixed(2)}  MFER=$${resumenData.MontoFeriado.toFixed(2)}`);
        console.log(`  TotalHoras=${totalHoras.toFixed(2)}h  TotalPagar=$${totalPagar.toFixed(2)}`);

        if (totalHoras > 0) {
          const resumen = await ResumenQuincenalRepository.create({
            EmpleadoId: empleado.Id,
            Anio: parseInt(anio),
            Mes: parseInt(mes),
            Quincena: parseInt(quincena),
            Horas35: parseFloat(resumenData.Horas35.toFixed(2)),
            Horas100: parseFloat(resumenData.Horas100.toFixed(2)),
            Horas15: parseFloat(resumenData.Horas15.toFixed(2)),
            HorasFeriado: parseFloat(resumenData.HorasFeriado.toFixed(2)),
            Monto35: parseFloat(resumenData.Monto35.toFixed(2)),
            Monto100: parseFloat(resumenData.Monto100.toFixed(2)),
            Monto15: parseFloat(resumenData.Monto15.toFixed(2)),
            MontoFeriado: parseFloat(resumenData.MontoFeriado.toFixed(2))
          });
          resultados.push(resumen);
        }

        // Marcar registros como procesados
        const ids = regs.map(r => r.Id);
        if (ids.length > 0) {
          await RegistroAsistenciaRepository.marcarComoProcesados(ids, usuario);
        }
      }

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
        nombre: moment(`${anio}-${String(mes).padStart(2, '0')}-01`).format('MMMM YYYY'),
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
    const mesPad = String(mes).padStart(2, '0');
    if (parseInt(quincena) === 1) {
      return {
        inicio: `${anio}-${mesPad}-01`,
        fin: `${anio}-${mesPad}-15`
      };
    } else {
      const ultimoDia = moment(`${anio}-${mesPad}-01`).endOf('month').date();
      return {
        inicio: `${anio}-${mesPad}-16`,
        fin: `${anio}-${mesPad}-${String(ultimoDia).padStart(2, '0')}`
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

  /**
   * Calcular horas extras por tipo para un registro
   * Replica las formulas del Excel:
   *   L-V: H.E. 35% = totalHoras - 9 (base), solo si salida > 17:50 (gracia 20min)
   *   Sabado: H.E. 100% = (MIN(salida, entrada cap 9:00)) - 4h base
   *   Domingo: H.E. 100% = totalHoras (todo)
   *   Feriado: todas las horas trabajadas
   *   NOCT 15%: horas despues de 21:00 (recargo adicional, aplica en todos los dias)
   */
  _calcularExtras(entrada, salida, diaSemana, esFeriado) {
    const resultado = { horas35: 0, horas100: 0, horas15: 0, horasFeriado: 0 };

    const horasTrabajadas = this._calcHoras(entrada, salida);
    if (horasTrabajadas <= 0) return resultado;

    const esDomingo = diaSemana === 0;
    const esSabado = diaSemana === 6;

    const minSalida = this._horaToMin(salida);
    const inicioNocturno = this._horaToMin(HORARIOS_DEFAULT.NOCTURNO.inicio); // 21:00 = 1260

    // Categoria principal (mutuamente excluyente)
    if (esFeriado) {
      resultado.horasFeriado = horasTrabajadas;
    } else if (esDomingo) {
      // Domingo: todas las horas son al 100%
      resultado.horas100 = horasTrabajadas;
    } else if (esSabado) {
      // Sabado: capear entrada a las 9:00 AM (si llego antes, contar desde 9:00)
      const entradaSab = this._horaToMin(HORARIOS_DEFAULT.SABADO.entrada); // 9:00 = 540
      const entradaReal = this._horaToMin(entrada);
      const entradaEfectiva = Math.max(entradaReal, entradaSab);
      const horasEfectivas = (minSalida - entradaEfectiva) / 60;
      const baseSabado = HORARIOS_DEFAULT.SABADO.horasBase; // 4
      if (horasEfectivas > baseSabado) {
        resultado.horas100 = horasEfectivas - baseSabado;
      }
    } else {
      // Lunes a Viernes: gracia de 20 min (hasta 17:50)
      // Solo contar extras si salida > 17:50
      const graciaMin = this._horaToMin(HORARIOS_DEFAULT.SEMANA.salida) + 20; // 17:30 + 20 = 17:50 = 1070
      if (minSalida > graciaMin) {
        // HE 35% = total trabajado - 9h base, tope en inicio nocturno
        const salidaParaCalculo = Math.min(minSalida, inicioNocturno);
        const entradaMin = this._horaToMin(entrada);
        const horasDiurnas = (salidaParaCalculo - entradaMin) / 60;
        const baseSemana = HORARIOS_DEFAULT.SEMANA.horasBase; // 9
        resultado.horas35 = Math.max(0, horasDiurnas - baseSemana);
      }
    }

    // NOCT 15% - recargo ADICIONAL, aplica para cualquier dia
    if (minSalida > inicioNocturno) {
      resultado.horas15 = (minSalida - inicioNocturno) / 60;
    }

    return resultado;
  }

  _calcHoras(entrada, salida) {
    const minEnt = this._horaToMin(entrada);
    const minSal = this._horaToMin(salida);
    let diff = minSal - minEnt;
    if (diff < 0) diff += 24 * 60;
    return diff / 60;
  }

  _horaToMin(hora) {
    if (!hora) return 0;
    if (typeof hora !== 'string') return 0;
    const parts = hora.split(':');
    return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
  }
}

export default new QuincenaService();