// src/models/ConfiguracionJornada.model.js
import { DIAS_SEMANA } from '../utils/constants.js';

class ConfiguracionJornada {
  constructor(data = {}) {
    this.Id = data.Id;
    this.DiaSemana = data.DiaSemana;
    this.DiaNombre = data.DiaNombre || DIAS_SEMANA[data.DiaSemana] || '';
    this.HoraEntrada = data.HoraEntrada;
    this.HoraSalida = data.HoraSalida;
    this.HorasBase = data.HorasBase ? parseFloat(data.HorasBase) : 0;
    this.AplicaHorasExtras = data.AplicaHorasExtras === 1;
    this.PorcentajeExtra = data.PorcentajeExtra ? parseFloat(data.PorcentajeExtra) : 0;
    this.Activo = data.Activo === 1;
    this.FechaActualizacion = data.FechaActualizacion;
  }

  esDiaLaboral() {
    return this.HoraEntrada !== null && this.HoraSalida !== null;
  }

  calcularHorasJornada() {
    if (!this.HoraEntrada || !this.HoraSalida) return 0;

    const entrada = this._horaToMinutos(this.HoraEntrada);
    const salida = this._horaToMinutos(this.HoraSalida);

    return (salida - entrada) / 60;
  }

  _horaToMinutos(hora) {
    if (!hora) return 0;
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  toJSON() {
    return {
      id: this.Id,
      diaSemana: this.DiaSemana,
      diaNombre: this.DiaNombre,
      horaEntrada: this.HoraEntrada,
      horaSalida: this.HoraSalida,
      horasBase: this.HorasBase,
      aplicaHorasExtras: this.AplicaHorasExtras,
      porcentajeExtra: this.PorcentajeExtra,
      activo: this.Activo
    };
  }
}

export default ConfiguracionJornada;