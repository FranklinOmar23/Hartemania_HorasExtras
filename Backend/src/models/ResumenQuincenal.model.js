// src/models/ResumenQuincenal.model.js

class ResumenQuincenal {
  constructor(data = {}) {
    this.Id = data.Id;
    this.EmpleadoId = data.EmpleadoId;
    this.Anio = data.Anio;
    this.Mes = data.Mes;
    this.Quincena = data.Quincena;
    this.Horas35 = parseFloat(data.Horas35 || 0);
    this.Horas100 = parseFloat(data.Horas100 || 0);
    this.Horas15 = parseFloat(data.Horas15 || 0);
    this.HorasFeriado = parseFloat(data.HorasFeriado || 0);
    this.Monto35 = parseFloat(data.Monto35 || 0);
    this.Monto100 = parseFloat(data.Monto100 || 0);
    this.Monto15 = parseFloat(data.Monto15 || 0);
    this.MontoFeriado = parseFloat(data.MontoFeriado || 0);
    this.TotalHoras = parseFloat(data.TotalHoras || 0);
    this.TotalPagar = parseFloat(data.TotalPagar || 0);
    this.FechaCalculo = data.FechaCalculo;

    // Relaciones
    this.Empleado = null;
  }

  toJSON() {
    return {
      id: this.Id,
      empleadoId: this.EmpleadoId,
      empleado: this.Empleado ? this.Empleado.toJSON() : null,
      periodo: {
        anio: this.Anio,
        mes: this.Mes,
        quincena: this.Quincena,
        nombre: `Quincena ${this.Quincena} - ${this.Mes}/${this.Anio}`
      },
      horas: {
        '35%': this.Horas35,
        '100%': this.Horas100,
        '15%': this.Horas15,
        feriado: this.HorasFeriado,
        total: this.TotalHoras
      },
      montos: {
        '35%': this.Monto35,
        '100%': this.Monto100,
        '15%': this.Monto15,
        feriado: this.MontoFeriado,
        total: this.TotalPagar
      },
      fechaCalculo: this.FechaCalculo
    };
  }
}

export default ResumenQuincenal;