// src/models/RegistroAsistencia.model.js
import sql from 'mssql';
import { getConnection } from '../config/database.js';
import { TIPOS_REGISTRO, ORIGENES_DATOS } from '../utils/constants.js';
import Empleado from './Empleado.model.js';
import TipoHoraExtra from './TipoHoraExtra.model.js';

class RegistroAsistencia {
  constructor(data = {}) {
    this.Id = data.Id;
    this.EmpleadoId = data.EmpleadoId;
    this.ImportacionId = data.ImportacionId;
    this.Fecha = data.Fecha;
    this.HoraEntrada = data.HoraEntrada;
    this.HoraSalida = data.HoraSalida;
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
    
    // Datos relacionados (populados manualmente)
    this.Empleado = null;
    this.Calculos = [];
  }

  // ============================================
  // CRUD BÁSICO
  // ============================================

  static async crear(registroData) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('EmpleadoId', sql.Int, registroData.EmpleadoId)
        .input('ImportacionId', sql.Int, registroData.ImportacionId || null)
        .input('Fecha', sql.Date, registroData.Fecha)
        .input('HoraEntrada', sql.Time, registroData.HoraEntrada || null)
        .input('HoraSalida', sql.Time, registroData.HoraSalida || null)
        .input('TipoRegistro', sql.NVarChar, registroData.TipoRegistro || TIPOS_REGISTRO.IMPORTADO)
        .input('Origen', sql.NVarChar, registroData.Origen || ORIGENES_DATOS.EXCEL)
        .input('Comentarios', sql.NVarChar, registroData.Comentarios || null)
        .input('FilaExcel', sql.Int, registroData.FilaExcel || null)
        .input('UsuarioCreacion', sql.NVarChar, registroData.UsuarioCreacion || 'SISTEMA')
        .query(`
          INSERT INTO RegistrosAsistencia (
            EmpleadoId, ImportacionId, Fecha, HoraEntrada, HoraSalida,
            TipoRegistro, Origen, Comentarios, FilaExcel, UsuarioCreacion
          )
          OUTPUT INSERTED.*
          VALUES (
            @EmpleadoId, @ImportacionId, @Fecha, @HoraEntrada, @HoraSalida,
            @TipoRegistro, @Origen, @Comentarios, @FilaExcel, @UsuarioCreacion
          )
        `);
      
      return new RegistroAsistencia(result.recordset[0]);
    } catch (error) {
      throw new Error(`Error al crear registro: ${error.message}`);
    }
  }

  static async crearMultiples(registrosData) {
    const resultados = [];
    const errores = [];
    
    for (const registro of registrosData) {
      try {
        const nuevo = await this.crear(registro);
        resultados.push(nuevo);
      } catch (error) {
        errores.push({ registro, error: error.message });
      }
    }
    
    return { exitosos: resultados, errores };
  }

  static async obtenerPorId(id, incluirRelaciones = false) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Id', sql.Int, id)
        .query('SELECT * FROM RegistrosAsistencia WHERE Id = @Id');
      
      if (!result.recordset[0]) return null;
      
      const registro = new RegistroAsistencia(result.recordset[0]);
      
      if (incluirRelaciones) {
        registro.Empleado = await Empleado.obtenerPorId(registro.EmpleadoId);
        registro.Calculos = await this.obtenerCalculos(registro.Id);
      }
      
      return registro;
    } catch (error) {
      throw new Error(`Error al obtener registro: ${error.message}`);
    }
  }

  static async obtenerPorEmpleado(empleadoId, fechaInicio = null, fechaFin = null) {
    try {
      const pool = await getConnection();
      const request = pool.request()
        .input('EmpleadoId', sql.Int, empleadoId);
      
      let query = `
        SELECT * FROM RegistrosAsistencia 
        WHERE EmpleadoId = @EmpleadoId
      `;
      
      if (fechaInicio) {
        request.input('FechaInicio', sql.Date, fechaInicio);
        query += ' AND Fecha >= @FechaInicio';
      }
      
      if (fechaFin) {
        request.input('FechaFin', sql.Date, fechaFin);
        query += ' AND Fecha <= @FechaFin';
      }
      
      query += ' ORDER BY Fecha DESC';
      
      const result = await request.query(query);
      return result.recordset.map(row => new RegistroAsistencia(row));
    } catch (error) {
      throw new Error(`Error al obtener registros: ${error.message}`);
    }
  }

  static async obtenerPorImportacion(importacionId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('ImportacionId', sql.Int, importacionId)
        .query(`
          SELECT * FROM RegistrosAsistencia 
          WHERE ImportacionId = @ImportacionId
          ORDER BY FilaExcel
        `);
      
      return result.recordset.map(row => new RegistroAsistencia(row));
    } catch (error) {
      throw new Error(`Error al obtener registros: ${error.message}`);
    }
  }

  static async actualizar(id, registroData) {
    try {
      const pool = await getConnection();
      
      const camposActualizables = [
        'HoraEntrada', 'HoraSalida', 'Comentarios', 'Procesado', 'FechaProcesado'
      ];
      
      const request = pool.request();
      request.input('Id', sql.Int, id);
      
      const updates = [];
      camposActualizables.forEach(campo => {
        if (registroData[campo] !== undefined) {
          updates.push(`${campo} = @${campo}`);
          let type = campo.includes('Hora') ? sql.Time :
                     campo === 'Procesado' ? sql.Bit :
                     campo === 'FechaProcesado' ? sql.DateTime : sql.NVarChar;
          request.input(campo, type, registroData[campo]);
        }
      });
      
      updates.push('FechaActualizacion = GETDATE()');
      request.input('UsuarioActualizacion', sql.NVarChar, registroData.UsuarioActualizacion || 'SISTEMA');
      updates.push('UsuarioActualizacion = @UsuarioActualizacion');
      
      const query = `
        UPDATE RegistrosAsistencia 
        SET ${updates.join(', ')}
        OUTPUT INSERTED.*
        WHERE Id = @Id
      `;
      
      const result = await request.query(query);
      return result.recordset[0] ? new RegistroAsistencia(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al actualizar registro: ${error.message}`);
    }
  }

  static async eliminar(id) {
    try {
      const pool = await getConnection();
      
      // Eliminar primero los cálculos relacionados
      await pool.request()
        .input('RegistroId', sql.Int, id)
        .query('DELETE FROM CalculosHorasExtras WHERE RegistroAsistenciaId = @RegistroId');
      
      // Eliminar el registro
      await pool.request()
        .input('Id', sql.Int, id)
        .query('DELETE FROM RegistrosAsistencia WHERE Id = @Id');
      
      return { success: true, message: 'Registro eliminado correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar registro: ${error.message}`);
    }
  }

  // ============================================
  // MÉTODOS DE CÁLCULO
  // ============================================

  static async obtenerCalculos(registroId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('RegistroId', sql.Int, registroId)
        .query(`
          SELECT ch.*, th.Codigo as TipoHoraCodigo, th.Descripcion as TipoHoraDescripcion
          FROM CalculosHorasExtras ch
          INNER JOIN TiposHorasExtras th ON ch.TipoHEId = th.Id
          WHERE ch.RegistroAsistenciaId = @RegistroId
        `);
      
      return result.recordset;
    } catch (error) {
      throw new Error(`Error al obtener cálculos: ${error.message}`);
    }
  }

  async guardarCalculo(tipoHoraId, horas, valorHora, monto, usuario = 'SISTEMA') {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('RegistroId', sql.Int, this.Id)
        .input('TipoHEId', sql.Int, tipoHoraId)
        .input('Horas', sql.Decimal(10,2), horas)
        .input('ValorHora', sql.Decimal(10,2), valorHora)
        .input('Monto', sql.Decimal(10,2), monto)
        .input('Usuario', sql.NVarChar, usuario)
        .query(`
          INSERT INTO CalculosHorasExtras (
            RegistroAsistenciaId, TipoHEId, Horas, ValorHora, Monto, UsuarioCalculo
          )
          OUTPUT INSERTED.*
          VALUES (@RegistroId, @TipoHEId, @Horas, @ValorHora, @Monto, @Usuario)
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Error al guardar cálculo: ${error.message}`);
    }
  }

  // ============================================
  // MÉTODOS DE UTILIDAD
  // ============================================

  tieneMarcacionesCompletas() {
    return this.HoraEntrada !== null && this.HoraSalida !== null;
  }

  calcularHorasTrabajadas() {
    if (!this.tieneMarcacionesCompletas()) return 0;
    
    const entrada = this._horaToMinutos(this.HoraEntrada);
    const salida = this._horaToMinutos(this.HoraSalida);
    
    let minutos = salida - entrada;
    if (minutos < 0) minutos += 24 * 60; // Cruza medianoche
    
    return minutos / 60;
  }

  _horaToMinutos(hora) {
    if (!hora) return 0;
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