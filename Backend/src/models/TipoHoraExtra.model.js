// src/models/TipoHoraExtra.model.js

class TipoHoraExtra {
  constructor(data = {}) {
    this.Id = data.Id;
    this.Codigo = data.Codigo;
    this.Descripcion = data.Descripcion;
    this.Porcentaje = parseFloat(data.Porcentaje || 0);
    this.FactorMultiplicador = parseFloat(data.FactorMultiplicador || 1);
    this.ColorHex = data.ColorHex;
    this.Orden = data.Orden || 0;
    this.AplicaFinSemana = data.AplicaFinSemana === 1;
    this.AplicaFeriados = data.AplicaFeriados === 1;
    this.AplicaNocturno = data.AplicaNocturno === 1;
    this.Activo = data.Activo === 1;
    this.FechaCreacion = data.FechaCreacion;
  }

  calcularMonto(horas, valorHora) {
    return horas * valorHora * this.FactorMultiplicador;
  }

  toJSON() {
    return {
      id: this.Id,
      codigo: this.Codigo,
      descripcion: this.Descripcion,
      porcentaje: this.Porcentaje,
      factorMultiplicador: this.FactorMultiplicador,
      colorHex: this.ColorHex,
      orden: this.Orden,
      aplicaFinSemana: this.AplicaFinSemana,
      aplicaFeriados: this.AplicaFeriados,
      aplicaNocturno: this.AplicaNocturno,
      activo: this.Activo
    };
  }
}

export default TipoHoraExtra;