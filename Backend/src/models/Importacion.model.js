// src/models/Importacion.model.js
import { ESTADOS_IMPORTACION } from '../utils/constants.js';

class Importacion {
  constructor(data = {}) {
    this.Id = data.Id;
    this.NombreArchivo = data.NombreArchivo;
    this.FechaImportacion = data.FechaImportacion;
    this.UsuarioImportacion = data.UsuarioImportacion;
    this.TotalRegistros = data.TotalRegistros || 0;
    this.RegistrosValidos = data.RegistrosValidos || 0;
    this.RegistrosError = data.RegistrosError || 0;
    this.PeriodoInicio = data.PeriodoInicio;
    this.PeriodoFin = data.PeriodoFin;
    this.Estado = data.Estado || ESTADOS_IMPORTACION.PENDIENTE;
    this.Observaciones = data.Observaciones;
    this.FechaProcesado = data.FechaProcesado;
  }

  toJSON() {
    return {
      id: this.Id,
      nombreArchivo: this.NombreArchivo,
      fechaImportacion: this.FechaImportacion,
      usuario: this.UsuarioImportacion,
      totalRegistros: this.TotalRegistros,
      registrosValidos: this.RegistrosValidos,
      registrosError: this.RegistrosError,
      periodoInicio: this.PeriodoInicio,
      periodoFin: this.PeriodoFin,
      estado: this.Estado,
      observaciones: this.Observaciones,
      fechaProcesado: this.FechaProcesado
    };
  }
}

export default Importacion;