// src/models/RegistroAsistencia.model.js
import { TIPOS_REGISTRO, ORIGENES_DATOS } from '../utils/constants.js';

class RegistroAsistencia {
  constructor(data = {}) {
    this.Id = data.Id;
    this.EmpleadoId = data.EmpleadoId;
    this.ImportacionId = data.ImportacionId;
    this.Fecha = data.Fecha;
    this.HoraEntrada = this._normalizeHora(data.HoraEntrada);
    this.HoraSalida = this._normalizeHora(data.HoraSalida);
    this.TipoRegistro = data.TipoRegistro || TIPOS_REGISTRO.IMPORTADO;
    this.Origen = data.Origen || ORIGENES_DATOS.EXCEL;
    this.Comentarios = data.Comentarios;
    this.FilaExcel = data.FilaExcel;
    this.Procesado = data.Procesado === 1;
    this.FechaProcesado = data.FechaProcesado;
    this.FechaCreacion = data.FechaCreacion;
    this.UsuarioCreacion = data.UsuarioCreacion;
    this.FechaActualizacion = data.FechaActualizacion;
    this.UsuarioActualizacion = data.UsuarioActualizacion;
    
    this.Empleado = null;
    this.Calculos = [];
  }

  _normalizeHora(valor) {
    if (!valor) return null;
    if (typeof valor === 'string') return valor;
    // SQL Server TIME viene como Date object
    if (valor instanceof Date) {
      const h = valor.getUTCHours().toString().padStart(2, '0');
      const m = valor.getUTCMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    }
    // Fallback: intentar extraer HH:MM del toString
    const str = valor.toString();
    const match = str.match(/(\d{1,2}):(\d{2})/);
    if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
    return null;
  }

  tieneMarcacionesCompletas() {
    return this.HoraEntrada !== null && this.HoraSalida !== null;
  }

  calcularHorasTrabajadas() {
    if (!this.tieneMarcacionesCompletas()) return 0;
    
    const entrada = this._horaToMinutos(this.HoraEntrada);
    const salida = this._horaToMinutos(this.HoraSalida);
    
    let minutos = salida - entrada;
    if (minutos < 0) minutos += 24 * 60;
    
    return minutos / 60;
  }

  _horaToMinutos(hora) {
    if (!hora) return 0;
    // Si es Date object (SQL Server TIME viene como Date)
    if (hora instanceof Date) {
      return hora.getUTCHours() * 60 + hora.getUTCMinutes();
    }
    if (typeof hora !== 'string') {
      const str = hora.toString();
      const match = str.match(/(\d{1,2}):(\d{2})/);
      if (match) return parseInt(match[1]) * 60 + parseInt(match[2]);
      return 0;
    }
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  toJSON() {
    return {
      id: this.Id,
      empleadoId: this.EmpleadoId,
      empleado: this.Empleado ? this.Empleado.toJSON() : null,
      importacionId: this.ImportacionId,
      fecha: this.Fecha,
      horaEntrada: this.HoraEntrada,
      horaSalida: this.HoraSalida,
      tipoRegistro: this.TipoRegistro,
      origen: this.Origen,
      comentarios: this.Comentarios,
      filaExcel: this.FilaExcel,
      procesado: this.Procesado,
      fechaProcesado: this.FechaProcesado,
      calculos: this.Calculos,
      horasTrabajadas: this.calcularHorasTrabajadas()
    };
  }
}

export default RegistroAsistencia;