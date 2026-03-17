// src/models/Importacion.model.js
import sql from 'mssql';
import { getConnection } from '../config/database.js';
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

  // ============================================
  // CRUD BÁSICO
  // ============================================

  static async crear(importacionData) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('NombreArchivo', sql.NVarChar, importacionData.NombreArchivo)
        .input('UsuarioImportacion', sql.NVarChar, importacionData.UsuarioImportacion || 'SISTEMA')
        .input('TotalRegistros', sql.Int, importacionData.TotalRegistros || 0)
        .input('RegistrosValidos', sql.Int, importacionData.RegistrosValidos || 0)
        .input('RegistrosError', sql.Int, importacionData.RegistrosError || 0)
        .input('PeriodoInicio', sql.Date, importacionData.PeriodoInicio || null)
        .input('PeriodoFin', sql.Date, importacionData.PeriodoFin || null)
        .input('Estado', sql.NVarChar, importacionData.Estado || ESTADOS_IMPORTACION.PENDIENTE)
        .input('Observaciones', sql.NVarChar, importacionData.Observaciones || null)
        .query(`
          INSERT INTO Importaciones (
            NombreArchivo, UsuarioImportacion, TotalRegistros, RegistrosValidos,
            RegistrosError, PeriodoInicio, PeriodoFin, Estado, Observaciones
          )
          OUTPUT INSERTED.*
          VALUES (
            @NombreArchivo, @UsuarioImportacion, @TotalRegistros, @RegistrosValidos,
            @RegistrosError, @PeriodoInicio, @PeriodoFin, @Estado, @Observaciones
          )
        `);
      
      return new Importacion(result.recordset[0]);
    } catch (error) {
      throw new Error(`Error al crear importación: ${error.message}`);
    }
  }

  static async obtenerPorId(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Id', sql.Int, id)
        .query('SELECT * FROM Importaciones WHERE Id = @Id');
      
      return result.recordset[0] ? new Importacion(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener importación: ${error.message}`);
    }
  }

  static async obtenerTodas(pagina = 1, limite = 20) {
    try {
      const pool = await getConnection();
      const offset = (pagina - 1) * limite;
      
      const result = await pool.request()
        .input('Offset', sql.Int, offset)
        .input('Limite', sql.Int, limite)
        .query(`
          SELECT * FROM Importaciones 
          ORDER BY FechaImportacion DESC
          OFFSET @Offset ROWS
          FETCH NEXT @Limite ROWS ONLY
        `);
      
      const countResult = await pool.request()
        .query('SELECT COUNT(*) as Total FROM Importaciones');
      
      return {
        data: result.recordset.map(row => new Importacion(row)),
        total: countResult.recordset[0].Total
      };
    } catch (error) {
      throw new Error(`Error al obtener importaciones: ${error.message}`);
    }
  }

  static async actualizarEstado(id, estado, observaciones = null) {
    try {
      const pool = await getConnection();
      const request = pool.request()
        .input('Id', sql.Int, id)
        .input('Estado', sql.NVarChar, estado);
      
      let query = `
        UPDATE Importaciones 
        SET Estado = @Estado
      `;
      
      if (estado === ESTADOS_IMPORTACION.PROCESADO) {
        query += ', FechaProcesado = GETDATE()';
      }
      
      if (observaciones) {
        request.input('Observaciones', sql.NVarChar, observaciones);
        query += ', Observaciones = @Observaciones';
      }
      
      query += ' WHERE Id = @Id; SELECT * FROM Importaciones WHERE Id = @Id';
      
      const result = await request.query(query);
      return result.recordset[0] ? new Importacion(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }
  }

  // ============================================
  // MÉTODOS DE ESTADÍSTICAS
  // ============================================

  static async obtenerResumenPorPeriodo(fechaInicio, fechaFin) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('FechaInicio', sql.Date, fechaInicio)
        .input('FechaFin', sql.Date, fechaFin)
        .query(`
          SELECT 
            COUNT(*) as TotalImportaciones,
            SUM(TotalRegistros) as TotalRegistros,
            SUM(RegistrosValidos) as TotalValidos,
            SUM(RegistrosError) as TotalErrores,
            MIN(FechaImportacion) as PrimeraImportacion,
            MAX(FechaImportacion) as UltimaImportacion
          FROM Importaciones
          WHERE FechaImportacion BETWEEN @FechaInicio AND @FechaFin
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Error al obtener resumen: ${error.message}`);
    }
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