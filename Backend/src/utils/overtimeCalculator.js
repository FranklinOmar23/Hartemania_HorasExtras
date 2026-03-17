// src/utils/overtimeCalculator.js
import dateHelpers from './dateHelpers.js';
import { HORARIOS_DEFAULT, TIPOS_HORAS_EXTRAS } from './constants.js';

class OvertimeCalculator {
  constructor() {
    this.horarios = HORARIOS_DEFAULT;
  }

  /**
   * Calcular horas extras para un registro
   */
  calcular(entrada, salida, fecha, salarioPorHora, esFeriado = false) {
    // Validar horas
    if (!entrada || !salida) {
      return {
        error: true,
        message: 'Horas incompletas',
        horas: { total: 0 }
      };
    }

    const diaSemana = dateHelpers.getDayOfWeek(fecha);
    const esFinSemana = diaSemana === 0 || diaSemana === 6;

    // Calcular horas trabajadas
    const horasTrabajadas = dateHelpers.getHoursDifference(entrada, salida);

    // Determinar horas base según el día
    const horasBase = this._getHorasBase(diaSemana, esFeriado);

    // Calcular horas extras
    const horasExtras = this._calcularHorasExtras(
      entrada,
      salida,
      horasBase,
      esFinSemana,
      esFeriado
    );

    // Calcular montos
    const montos = this._calcularMontos(horasExtras, salarioPorHora);

    return {
      error: false,
      fecha,
      diaSemana,
      esFinSemana,
      esFeriado,
      horasTrabajadas: this._round(horasTrabajadas),
      horasBase,
      horasExtras,
      montos,
      totalHoras: this._round(horasExtras.total),
      totalPagar: this._round(montos.total)
    };
  }

  /**
   * Obtener horas base según día
   */
  _getHorasBase(diaSemana, esFeriado) {
    if (esFeriado) return 0;
    
    if (diaSemana === 0) return 0; // Domingo
    if (diaSemana === 6) return this.horarios.SABADO.horasBase; // Sábado
    return this.horarios.SEMANA.horasBase; // Lunes a Viernes
  }

  /**
   * Calcular distribución de horas extras
   */
  _calcularHorasExtras(entrada, salida, horasBase, esFinSemana, esFeriado) {
    const resultado = {
      '35%': 0,
      '100%': 0,
      '15%': 0,
      total: 0
    };

    // Si es feriado, todo es 100%
    if (esFeriado) {
      const horas = dateHelpers.getHoursDifference(entrada, salida);
      resultado['100%'] = this._round(horas);
      resultado.total = this._round(horas);
      return resultado;
    }

    // Si es fin de semana, todo es 100%
    if (esFinSemana) {
      const horas = dateHelpers.getHoursDifference(entrada, salida);
      resultado['100%'] = this._round(horas);
      resultado.total = this._round(horas);
      return resultado;
    }

    // Días de semana - calcular extras después de horario normal
    const horaSalidaNormal = this.horarios.SEMANA.salida;
    const inicioNocturno = this.horarios.NOCTURNO.inicio;

    // Si salió después del horario normal
    if (this._esMayor(salida, horaSalidaNormal)) {
      let minutosExtra = dateHelpers.getMinutesDifference(horaSalidaNormal, salida);
      
      // Verificar si parte es nocturna
      if (this._esMayor(salida, inicioNocturno)) {
        const minutosNocturnos = dateHelpers.getMinutesDifference(inicioNocturno, salida);
        const minutosDiurnosExtra = minutosExtra - minutosNocturnos;
        
        resultado['35%'] = this._round(minutosDiurnosExtra / 60);
        resultado['15%'] = this._round(minutosNocturnos / 60);
      } else {
        resultado['35%'] = this._round(minutosExtra / 60);
      }
    }

    resultado.total = this._round(resultado['35%'] + resultado['100%'] + resultado['15%']);
    
    return resultado;
  }

  /**
   * Calcular montos
   */
  _calcularMontos(horasExtras, salarioPorHora) {
    const montos = {
      '35%': 0,
      '100%': 0,
      '15%': 0,
      total: 0
    };

    montos['35%'] = this._round(horasExtras['35%'] * salarioPorHora * TIPOS_HORAS_EXTRAS.DIURNA.factor);
    montos['100%'] = this._round(horasExtras['100%'] * salarioPorHora * TIPOS_HORAS_EXTRAS.FIN_SEMANA.factor);
    montos['15%'] = this._round(horasExtras['15%'] * salarioPorHora * TIPOS_HORAS_EXTRAS.NOCTURNA.factor);
    montos.total = this._round(montos['35%'] + montos['100%'] + montos['15%']);

    return montos;
  }

  /**
   * Comparar si hora1 es mayor que hora2
   */
  _esMayor(hora1, hora2) {
    const [h1, m1] = hora1.split(':').map(Number);
    const [h2, m2] = hora2.split(':').map(Number);
    
    return (h1 * 60 + m1) > (h2 * 60 + m2);
  }

  /**
   * Redondear a 2 decimales
   */
  _round(value) {
    return Math.round(value * 100) / 100;
  }

  /**
   * Calcular total de horas extras en un período
   */
  calcularTotalPeriodo(calculos) {
    return calculos.reduce((acc, calc) => {
      acc.horas['35%'] += calc.horasExtras['35%'];
      acc.horas['100%'] += calc.horasExtras['100%'];
      acc.horas['15%'] += calc.horasExtras['15%'];
      acc.montos['35%'] += calc.montos['35%'];
      acc.montos['100%'] += calc.montos['100%'];
      acc.montos['15%'] += calc.montos['15%'];
      return acc;
    }, {
      horas: { '35%': 0, '100%': 0, '15%': 0 },
      montos: { '35%': 0, '100%': 0, '15%': 0 }
    });
  }

  /**
   * Validar límite legal
   */
  validarLimiteLegal(horasExtrasAcumuladas) {
    return {
      dentroLimite: horasExtrasAcumuladas <= 68,
      actual: horasExtrasAcumuladas,
      limite: 68,
      excedente: Math.max(0, horasExtrasAcumuladas - 68)
    };
  }

  /**
   * Formatear resultado para respuesta
   */
  formatResult(calculo) {
    return {
      fecha: calculo.fecha,
      diaSemana: calculo.diaSemana,
      esFinSemana: calculo.esFinSemana,
      esFeriado: calculo.esFeriado,
      horasTrabajadas: calculo.horasTrabajadas,
      horasBase: calculo.horasBase,
      horasExtras: {
        diurnas: calculo.horasExtras['35%'],
        finSemana: calculo.horasExtras['100%'],
        nocturnas: calculo.horasExtras['15%'],
        total: calculo.totalHoras
      },
      montos: {
        diurnas: calculo.montos['35%'],
        finSemana: calculo.montos['100%'],
        nocturnas: calculo.montos['15%'],
        total: calculo.totalPagar
      }
    };
  }
}

export default new OvertimeCalculator();