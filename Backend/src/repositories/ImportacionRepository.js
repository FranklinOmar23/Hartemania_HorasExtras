// src/repositories/ImportacionRepository.js
import BaseRepository from './BaseRepository.js';
import Importacion from '../models/Importacion.model.js';
import { getConnection, TYPES } from '../config/database.js';
import { ESTADOS_IMPORTACION } from '../utils/constants.js';

class ImportacionRepository extends BaseRepository {
  constructor() {
    super('Importaciones', Importacion);
  }

  /**
   * Crear importación con estadísticas iniciales
   */
  async crearImportacion(nombreArchivo, usuario, totalRegistros = 0) {
    return await this.create({
      NombreArchivo: nombreArchivo,
      UsuarioImportacion: usuario,
      TotalRegistros: totalRegistros,
      RegistrosValidos: 0,
      RegistrosError: 0,
      Estado: ESTADOS_IMPORTACION.PENDIENTE
    });
  }

  /**
   * Actualizar estadísticas de importación
   */
  async actualizarEstadisticas(id, validos, errores, periodoInicio = null, periodoFin = null) {
    try {
      const pool = await getConnection();
      const request = pool.request()
        .input('Id', TYPES.Int, id)
        .input('RegistrosValidos', TYPES.Int, validos)
        .input('RegistrosError', TYPES.Int, errores);
      
      let query = `
        UPDATE Importaciones 
        SET RegistrosValidos = @RegistrosValidos,
            RegistrosError = @RegistrosError
      `;
      
      if (periodoInicio) {
        request.input('PeriodoInicio', TYPES.NVarChar, periodoInicio);
        query += ', PeriodoInicio = @PeriodoInicio';
      }
      
      if (periodoFin) {
        request.input('PeriodoFin', TYPES.NVarChar, periodoFin);
        query += ', PeriodoFin = @PeriodoFin';
      }
      
      query += ' WHERE Id = @Id; SELECT * FROM Importaciones WHERE Id = @Id';
      
      const result = await request.query(query);
      return result.recordset[0] ? new Importacion(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al actualizar estadísticas: ${error.message}`);
    }
  }

  /**
   * Cambiar estado de importación
   */
  async cambiarEstado(id, estado, observaciones = null) {
    try {
      const pool = await getConnection();
      const request = pool.request()
        .input('Id', TYPES.Int, id)
        .input('Estado', TYPES.NVarChar, estado);
      
      let query = `
        UPDATE Importaciones 
        SET Estado = @Estado
      `;
      
      if (estado === ESTADOS_IMPORTACION.PROCESADO) {
        query += ', FechaProcesado = GETDATE()';
      }
      
      if (observaciones) {
        request.input('Observaciones', TYPES.NVarChar, observaciones);
        query += ', Observaciones = @Observaciones';
      }
      
      query += ' WHERE Id = @Id; SELECT * FROM Importaciones WHERE Id = @Id';
      
      const result = await request.query(query);
      return result.recordset[0] ? new Importacion(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }
  }

  /**
   * Obtener importaciones por estado
   */
  async findByEstado(estado, pagina = 1, limite = 20) {
    return await this.findAll(
      'Estado = @Estado',
      { Estado: estado },
      pagina,
      limite,
      'FechaImportacion DESC'
    );
  }

  /**
   * Obtener importaciones por usuario
   */
  async findByUsuario(usuario, pagina = 1, limite = 20) {
    return await this.findAll(
      'UsuarioImportacion = @Usuario',
      { Usuario: usuario },
      pagina,
      limite,
      'FechaImportacion DESC'
    );
  }

  /**
   * Obtener importaciones por período
   */
  async findByPeriodo(fechaInicio, fechaFin, pagina = 1, limite = 20) {
    try {
      const pool = await getConnection();
      const offset = (pagina - 1) * limite;
      
      const result = await pool.request()
        .input('FechaInicio', TYPES.NVarChar, fechaInicio)
        .input('FechaFin', TYPES.NVarChar, fechaFin)
        .input('Offset', TYPES.Int, offset)
        .input('Limite', TYPES.Int, limite)
        .query(`
          SELECT * FROM Importaciones 
          WHERE CONVERT(VARCHAR(10), FechaImportacion, 23) BETWEEN @FechaInicio AND @FechaFin
          ORDER BY FechaImportacion DESC
          OFFSET @Offset ROWS
          FETCH NEXT @Limite ROWS ONLY
        `);
      
      const countResult = await pool.request()
        .input('FechaInicio', TYPES.NVarChar, fechaInicio)
        .input('FechaFin', TYPES.NVarChar, fechaFin)
        .query(`
          SELECT COUNT(*) as Total FROM Importaciones 
          WHERE CONVERT(VARCHAR(10), FechaImportacion, 23) BETWEEN @FechaInicio AND @FechaFin
        `);
      
      return {
        data: result.recordset.map(row => new Importacion(row)),
        total: countResult.recordset[0].Total,
        pagina,
        limite
      };
    } catch (error) {
      throw new Error(`Error al obtener importaciones por período: ${error.message}`);
    }
  }

  /**
   * Obtener resumen de importaciones
   */
  async getResumen() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            COUNT(*) as TotalImportaciones,
            SUM(CASE WHEN Estado = 'PENDIENTE' THEN 1 ELSE 0 END) as Pendientes,
            SUM(CASE WHEN Estado = 'PROCESADO' THEN 1 ELSE 0 END) as Procesadas,
            SUM(CASE WHEN Estado = 'ERROR' THEN 1 ELSE 0 END) as ConError,
            SUM(TotalRegistros) as TotalRegistros,
            SUM(RegistrosValidos) as TotalValidos,
            SUM(RegistrosError) as TotalErrores,
            MAX(FechaImportacion) as UltimaImportacion
          FROM Importaciones
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Error al obtener resumen: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas por mes
   */
  async getEstadisticasPorMes(anio) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Anio', TYPES.Int, anio)
        .query(`
          SELECT 
            MONTH(FechaImportacion) as Mes,
            COUNT(*) as CantidadImportaciones,
            SUM(TotalRegistros) as TotalRegistros,
            SUM(RegistrosValidos) as RegistrosValidos,
            SUM(RegistrosError) as RegistrosError,
            AVG(RegistrosValidos * 1.0 / NULLIF(TotalRegistros, 0)) * 100 as TasaExito
          FROM Importaciones
          WHERE YEAR(FechaImportacion) = @Anio
          GROUP BY MONTH(FechaImportacion)
          ORDER BY Mes
        `);
      
      return result.recordset;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas por mes: ${error.message}`);
    }
  }

  /**
   * Eliminar importación y sus registros asociados
   */
  async eliminarConRegistros(id) {
    const transaction = await this.transaction(async (t) => {
      // Eliminar cálculos de horas extras de los registros
      await t.request()
        .input('ImportacionId', TYPES.Int, id)
        .query(`
          DELETE ch 
          FROM CalculosHorasExtras ch
          INNER JOIN RegistrosAsistencia ra ON ch.RegistroAsistenciaId = ra.Id
          WHERE ra.ImportacionId = @ImportacionId
        `);
      
      // Eliminar registros de asistencia
      await t.request()
        .input('ImportacionId', TYPES.Int, id)
        .query('DELETE FROM RegistrosAsistencia WHERE ImportacionId = @ImportacionId');
      
      // Eliminar errores de importación
      await t.request()
        .input('ImportacionId', TYPES.Int, id)
        .query('DELETE FROM ErroresImportacion WHERE ImportacionId = @ImportacionId');
      
      // Eliminar la importación
      const result = await t.request()
        .input('Id', TYPES.Int, id)
        .query('DELETE FROM Importaciones WHERE Id = @Id');
      
      return { success: true, message: 'Importación y datos asociados eliminados' };
    });
    
    return transaction;
  }
}

export default new ImportacionRepository();