// src/models/Empleado.model.js
import { TIPOS_JORNADA } from '../utils/constants.js';

class Empleado {
  constructor(data = {}) {
    this.Id = data.Id;
    this.Codigo = data.Codigo;
    this.Nombre = data.Nombre;
    this.Apellido = data.Apellido;
    this.NombreCompleto = data.Nombre && data.Apellido ? `${data.Nombre} ${data.Apellido}` : '';
    this.Posicion = data.Posicion;
    this.Departamento = data.Departamento;
    this.SalarioBase = data.SalarioBase ? parseFloat(data.SalarioBase) : 0;
    this.SalarioDiario = data.SalarioDiario ? parseFloat(data.SalarioDiario) : 0;
    this.SalarioPorHora = data.SalarioPorHora ? parseFloat(data.SalarioPorHora) : 0;
    this.FechaIngreso = data.FechaIngreso;
    this.TipoJornada = data.TipoJornada || TIPOS_JORNADA.DIURNA;
    this.Activo = data.Activo !== undefined ? data.Activo : 1;
    this.FechaCreacion = data.FechaCreacion;
    this.FechaActualizacion = data.FechaActualizacion;
    this.UsuarioCreacion = data.UsuarioCreacion;
    this.UsuarioActualizacion = data.UsuarioActualizacion;
  }

  calcularValorHora() {
    return this.SalarioBase / 23.83 / 8;
  }

  calcularValorHoraExtra(tipoHora) {
    const valorHora = this.calcularValorHora();
    return valorHora * tipoHora.FactorMultiplicador;
  }

  validarSalario() {
    return this.SalarioBase > 0;
  }

  validarCodigo() {
    return this.Codigo && this.Codigo.length > 0;
  }

  toJSON() {
    return {
      id: this.Id,
      codigo: this.Codigo,
      nombre: this.Nombre,
      apellido: this.Apellido,
      nombreCompleto: this.NombreCompleto,
      posicion: this.Posicion,
      departamento: this.Departamento,
      salarioBase: this.SalarioBase,
      salarioDiario: this.SalarioDiario,
      salarioPorHora: this.SalarioPorHora,
      fechaIngreso: this.FechaIngreso,
      tipoJornada: this.TipoJornada,
      activo: this.Activo == 1 || this.Activo === true
    };
  }
}

export default Empleado;