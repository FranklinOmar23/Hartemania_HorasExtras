// src/models/TipoHoraExtra.model.js
import sql from 'mssql';
import { getConnection } from '../config/database.js';
import { TIPOS_HORAS_EXTRAS } from '../utils/constants.js';

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

  // ============================================
  // CRUD BÁSICO
  // ============================================

  static async obtenerTodos(activo = true) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Activo', sql.Bit, activo)
        .query(`
          SELECT * FROM TiposHorasExtras 
          WHERE Activo = @Activo 
          ORDER BY Orden
        `);
      
      return result.recordset.map(row => new TipoHoraExtra(row));
    } catch (error) {
      throw new Error(`Error al obtener tipos: ${error.message}`);
    }
  }

  static async obtenerPorId(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Id', sql.Int, id)
        .query('SELECT * FROM TiposHorasExtras WHERE Id = @Id');
      
      return result.recordset[0] ? new TipoHoraExtra(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener tipo: ${error.message}`);
    }
  }

  static async obtenerPorCodigo(codigo) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Codigo', sql.NVarChar, codigo)
        .query('SELECT * FROM TiposHorasExtras WHERE Codigo = @Codigo');
      
      return result.recordset[0] ? new TipoHoraExtra(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener tipo por código: ${error.message}`);
    }
  }

  static async crear(data) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Codigo', sql.NVarChar, data.Codigo)
        .input('Descripcion', sql.NVarChar, data.Descripcion)
        .input('Porcentaje', sql.Decimal(5,2), data.Porcentaje)
        .input('FactorMultiplicador', sql.Decimal(5,2), data.FactorMultiplicador || (1 + data.Porcentaje / 100))
        .input('ColorHex', sql.NVarChar, data.ColorHex || null)
        .input('Orden', sql.Int, data.Orden || 0)
        .input('AplicaFinSemana', sql.Bit, data.AplicaFinSemana || 0)
        .input('AplicaFeriados', sql.Bit, data.AplicaFeriados || 0)
        .input('AplicaNocturno', sql.Bit, data.AplicaNocturno || 0)
        .query(`
          INSERT INTO TiposHorasExtras (
            Codigo, Descripcion, Porcentaje, FactorMultiplicador, ColorHex,
            Orden, AplicaFinSemana, AplicaFeriados, AplicaNocturno
          )
          OUTPUT INSERTED.*
          VALUES (
            @Codigo, @Descripcion, @Porcentaje, @FactorMultiplicador, @ColorHex,
            @Orden, @AplicaFinSemana, @AplicaFeriados, @AplicaNocturno
          )
        `);
      
      return new TipoHoraExtra(result.recordset[0]);
    } catch (error) {
      throw new Error(`Error al crear tipo: ${error.message}`);
    }
  }

  static async actualizar(id, data) {
    try {
      const pool = await getConnection();
      
      const camposActualizables = [
        'Codigo', 'Descripcion', 'Porcentaje', 'FactorMultiplicador',
        'ColorHex', 'Orden', 'AplicaFinSemana', 'AplicaFeriados', 'AplicaNocturno', 'Activo'
      ];
      
      const request = pool.request();
      request.input('Id', sql.Int, id);
      
      const updates = [];
      camposActualizables.forEach(campo => {
        if (data[campo] !== undefined) {
          updates.push(`${campo} = @${campo}`);
          let type = sql.NVarChar;
          if (campo.includes('Porcentaje') || campo.includes('Factor')) type = sql.Decimal(5,2);
          else if (campo === 'Orden') type = sql.Int;
          else if (campo.includes('Aplica') || campo === 'Activo') type = sql.Bit;
          request.input(campo, type, data[campo]);
        }
      });
      
      const query = `
        UPDATE TiposHorasExtras 
        SET ${updates.join(', ')}
        OUTPUT INSERTED.*
        WHERE Id = @Id
      `;
      
      const result = await request.query(query);
      return result.recordset[0] ? new TipoHoraExtra(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al actualizar tipo: ${error.message}`);
    }
  }

  static async eliminar(id) {
    try {
      const pool = await getConnection();
      
      // Soft delete
      await pool.request()
        .input('Id', sql.Int, id)
        .query('UPDATE TiposHorasExtras SET Activo = 0 WHERE Id = @Id');
      
      return { success: true, message: 'Tipo eliminado correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar tipo: ${error.message}`);
    }
  }

  // ============================================
  // MÉTODOS DE UTILIDAD
  // ============================================

  static async obtenerPorDia(fecha, esFeriado = false) {
    const dia = new Date(fecha).getDay();
    const esFinSemana = dia === 0 || dia === 6;
    
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('EsFinSemana', sql.Bit, esFinSemana)
        .input('EsFeriado', sql.Bit, esFeriado)
        .query(`
          SELECT * FROM TiposHorasExtras 
          WHERE Activo = 1
          AND (
            (AplicaFinSemana = 1 AND @EsFinSemana = 1)
            OR (AplicaFeriados = 1 AND @EsFeriado = 1)
            OR (AplicaFinSemana = 0 AND AplicaFeriados = 0)
          )
          ORDER BY Orden
        `);
      
      return result.recordset.map(row => new TipoHoraExtra(row));
    } catch (error) {
      throw new Error(`Error al obtener tipos por día: ${error.message}`);
    }
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