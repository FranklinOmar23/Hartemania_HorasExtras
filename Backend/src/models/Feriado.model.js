// src/models/Feriado.model.js

class Feriado {
  constructor(data = {}) {
    this.Id = data.Id;
    this.Nombre = data.Nombre;
    this.Dia = data.Dia;
    this.Mes = data.Mes;
    this.Anio = data.Anio;
    this.EsFijo = data.EsFijo === 1;
    this.AplicaPorcentaje100 = data.AplicaPorcentaje100 === 1;
    this.Activo = data.Activo === 1;
    this.FechaCreacion = data.FechaCreacion;
  }

  toJSON() {
    return {
      id: this.Id,
      nombre: this.Nombre,
      dia: this.Dia,
      mes: this.Mes,
      anio: this.Anio,
      esFijo: this.EsFijo,
      aplicaPorcentaje100: this.AplicaPorcentaje100,
      activo: this.Activo
    };
  }
}

export default Feriado;