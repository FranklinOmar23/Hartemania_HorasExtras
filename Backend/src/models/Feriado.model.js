// src/models/Feriado.model.js
import sql from 'mssql';
import { getConnection } from '../config/database.js';
import moment from 'moment';

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

  // ============================================
  // CRUD BÁSICO
  // ============================================

  static async obtenerTodos(activo = true) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Activo', sql.Bit, activo)
        .query(`
          SELECT * FROM Feriados 
          WHERE Activo = @Activo 
          ORDER BY Mes, Dia
        `);
      
      return result.recordset.map(row => new Feriado(row));
    } catch (error) {
      throw new Error(`Error al obtener feriados: ${error.message}`);
    }
  }

  static async obtenerPorId(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Id', sql.Int, id)
        .query('SELECT * FROM Feriados WHERE Id = @Id');
      
      return result.recordset[0] ? new Feriado(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener feriado: ${error.message}`);
    }
  }

  static async crear(feriadoData) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Nombre', sql.NVarChar, feriadoData.Nombre)
        .input('Dia', sql.Int, feriadoData.Dia)
        .input('Mes', sql.Int, feriadoData.Mes)
        .input('Anio', sql.Int, feriadoData.Anio || null)
        .input('EsFijo', sql.Bit, feriadoData.EsFijo !== undefined ? feriadoData.EsFijo : 1)
        .input('AplicaPorcentaje100', sql.Bit, feriadoData.AplicaPorcentaje100 !== undefined ? feriadoData.AplicaPorcentaje100 : 1)
        .query(`
          INSERT INTO Feriados (Nombre, Dia, Mes, Anio, EsFijo, AplicaPorcentaje100)
          OUTPUT INSERTED.*
          VALUES (@Nombre, @Dia, @Mes, @Anio, @EsFijo, @AplicaPorcentaje100)
        `);
      
      return new Feriado(result.recordset[0]);
    } catch (error) {
      throw new Error(`Error al crear feriado: ${error.message}`);
    }
  }

  static async actualizar(id, feriadoData) {
    try {
      const pool = await getConnection();
      
      const request = pool.request();
      request.input('Id', sql.Int, id);
      
      const updates = [];
      const campos = ['Nombre', 'Dia', 'Mes', 'Anio', 'EsFijo', 'AplicaPorcentaje100', 'Activo'];
      
      campos.forEach(campo => {
        if (feriadoData[campo] !== undefined) {
          updates.push(`${campo} = @${campo}`);
          let type = campo === 'Anio' ? sql.Int : 
                     campo.includes('Porcentaje') ? sql.Bit : 
                     campo === 'Dia' || campo === 'Mes' ? sql.Int : sql.NVarChar;
          request.input(campo, type, feriadoData[campo]);
        }
      });
      
      const query = `
        UPDATE Feriados 
        SET ${updates.join(', ')}
        OUTPUT INSERTED.*
        WHERE Id = @Id
      `;
      
      const result = await request.query(query);
      return result.recordset[0] ? new Feriado(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al actualizar feriado: ${error.message}`);
    }
  }

  static async eliminar(id) {
    try {
      const pool = await getConnection();
      await pool.request()
        .input('Id', sql.Int, id)
        .query('DELETE FROM Feriados WHERE Id = @Id');
      
      return { success: true, message: 'Feriado eliminado correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar feriado: ${error.message}`);
    }
  }

  // ============================================
  // MÉTODOS DE VALIDACIÓN
  // ============================================

  static async esFeriado(fecha) {
    const date = moment(fecha);
    const dia = date.date();
    const mes = date.month() + 1;
    const anio = date.year();
    
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Dia', sql.Int, dia)
        .input('Mes', sql.Int, mes)
        .input('Anio', sql.Int, anio)
        .query(`
          SELECT * FROM Feriados 
          WHERE (EsFijo = 1 AND Dia = @Dia AND Mes = @Mes)
             OR (EsFijo = 0 AND Anio = @Anio AND Dia = @Dia AND Mes = @Mes)
          AND Activo = 1
        `);
      
      return result.recordset[0] ? new Feriado(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al verificar feriado: ${error.message}`);
    }
  }

  static async obtenerFeriadosPorAnio(anio) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Anio', sql.Int, anio)
        .query(`
          SELECT * FROM Feriados 
          WHERE (EsFijo = 1) OR (EsFijo = 0 AND Anio = @Anio)
          AND Activo = 1
          ORDER BY Mes, Dia
        `);
      
      return result.recordset.map(row => new Feriado(row));
    } catch (error) {
      throw new Error(`Error al obtener feriados del año: ${error.message}`);
    }
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