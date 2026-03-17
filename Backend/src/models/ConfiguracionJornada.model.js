// src/models/ConfiguracionJornada.model.js
import sql from 'mssql';
import { getConnection } from '../config/database.js';
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

  // ============================================
  // CRUD BÁSICO
  // ============================================

  static async obtenerTodos(activo = true) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Activo', sql.Bit, activo)
        .query(`
          SELECT * FROM ConfiguracionJornada 
          WHERE Activo = @Activo 
          ORDER BY DiaSemana
        `);
      
      return result.recordset.map(row => new ConfiguracionJornada(row));
    } catch (error) {
      throw new Error(`Error al obtener configuraciones: ${error.message}`);
    }
  }

  static async obtenerPorDia(diaSemana) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('DiaSemana', sql.Int, diaSemana)
        .query('SELECT * FROM ConfiguracionJornada WHERE DiaSemana = @DiaSemana');
      
      return result.recordset[0] ? new ConfiguracionJornada(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener configuración: ${error.message}`);
    }
  }

  static async actualizar(diaSemana, data) {
    try {
      const pool = await getConnection();
      
      const request = pool.request();
      request.input('DiaSemana', sql.Int, diaSemana);
      
      const updates = [];
      const campos = ['HoraEntrada', 'HoraSalida', 'HorasBase', 'AplicaHorasExtras', 'PorcentajeExtra', 'Activo'];
      
      campos.forEach(campo => {
        if (data[campo] !== undefined) {
          updates.push(`${campo} = @${campo}`);
          let type = sql.NVarChar;
          if (campo === 'HorasBase' || campo === 'PorcentajeExtra') type = sql.Decimal(4,2);
          else if (campo === 'AplicaHorasExtras' || campo === 'Activo') type = sql.Bit;
          request.input(campo, type, data[campo]);
        }
      });
      
      updates.push('FechaActualizacion = GETDATE()');
      
      const query = `
        UPDATE ConfiguracionJornada 
        SET ${updates.join(', ')}
        OUTPUT INSERTED.*
        WHERE DiaSemana = @DiaSemana
      `;
      
      const result = await request.query(query);
      return result.recordset[0] ? new ConfiguracionJornada(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al actualizar configuración: ${error.message}`);
    }
  }

  // ============================================
  // MÉTODOS DE UTILIDAD
  // ============================================

  static async obtenerJornadaPorFecha(fecha) {
    const dia = new Date(fecha).getDay();
    return await this.obtenerPorDia(dia);
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