// src/repositories/RegistroAsistenciaRepository.js
import BaseRepository from './BaseRepository.js';
import RegistroAsistencia from '../models/RegistroAsistencia.model.js';
import { getConnection, TYPES } from '../config/database.js';
import { TIPOS_REGISTRO, ORIGENES_DATOS } from '../utils/constants.js';

class RegistroAsistenciaRepository extends BaseRepository {
  constructor() {
    super('RegistrosAsistencia', RegistroAsistencia);
    
    // Valores por defecto para horas (ya no se usan, pero mantenemos por si acaso)
    this.HORARIO_DEFAULT_ENTRADA = '08:30';
    this.HORARIO_DEFAULT_SALIDA = '17:30';
  }

  /**
   * Buscar registros por empleado (con conversión de horas)
   */
  async findByEmpleado(empleadoId, fechaInicio = null, fechaFin = null) {
    try {
      const pool = await getConnection();
      const request = pool.request()
        .input('EmpleadoId', TYPES.Int, empleadoId);
      
      let query = `
        SELECT 
          Id,
          EmpleadoId,
          ImportacionId,
          Fecha,
          -- Convertir TIME a string HH:MM
          CONVERT(VARCHAR(5), HoraEntrada, 108) as HoraEntrada,
          CONVERT(VARCHAR(5), HoraSalida, 108) as HoraSalida,
          TipoRegistro,
          Origen,
          Comentarios,
          FilaExcel,
          Procesado,
          FechaProcesado,
          FechaCreacion,
          UsuarioCreacion,
          FechaActualizacion,
          UsuarioActualizacion
        FROM RegistrosAsistencia 
        WHERE EmpleadoId = @EmpleadoId
      `;
      
      if (fechaInicio) {
        request.input('FechaInicio', TYPES.Date, fechaInicio);
        query += ' AND Fecha >= @FechaInicio';
      }
      
      if (fechaFin) {
        request.input('FechaFin', TYPES.Date, fechaFin);
        query += ' AND Fecha <= @FechaFin';
      }
      
      query += ' ORDER BY Fecha DESC';
      
      const result = await request.query(query);
      return result.recordset.map(row => {
        // Convertir horas a string si es necesario
        if (row.HoraEntrada && typeof row.HoraEntrada !== 'string') {
          row.HoraEntrada = row.HoraEntrada.toString().substring(0, 5);
        }
        if (row.HoraSalida && typeof row.HoraSalida !== 'string') {
          row.HoraSalida = row.HoraSalida.toString().substring(0, 5);
        }
        return new RegistroAsistencia(row);
      });
    } catch (error) {
      throw new Error(`Error al buscar registros por empleado: ${error.message}`);
    }
  }

  /**
   * Buscar registros por importación
   */
  async findByImportacion(importacionId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('ImportacionId', TYPES.Int, importacionId)
        .query(`
          SELECT 
            Id,
            EmpleadoId,
            ImportacionId,
            Fecha,
            CONVERT(VARCHAR(5), HoraEntrada, 108) as HoraEntrada,
            CONVERT(VARCHAR(5), HoraSalida, 108) as HoraSalida,
            TipoRegistro,
            Origen,
            Comentarios,
            FilaExcel,
            Procesado,
            FechaProcesado,
            FechaCreacion,
            UsuarioCreacion,
            FechaActualizacion,
            UsuarioActualizacion
          FROM RegistrosAsistencia 
          WHERE ImportacionId = @ImportacionId
          ORDER BY FilaExcel
        `);
      
      return result.recordset.map(row => {
        if (row.HoraEntrada && typeof row.HoraEntrada !== 'string') {
          row.HoraEntrada = row.HoraEntrada.toString().substring(0, 5);
        }
        if (row.HoraSalida && typeof row.HoraSalida !== 'string') {
          row.HoraSalida = row.HoraSalida.toString().substring(0, 5);
        }
        return new RegistroAsistencia(row);
      });
    } catch (error) {
      throw new Error(`Error al obtener registros: ${error.message}`);
    }
  }

  /**
   * Buscar registros (TODOS, no solo pendientes)
   */
 // En RegistroAsistenciaRepository.js - findPendientes
async findPendientes(pagina = 1, limite = 20) {
  try {
    console.log(`🔍 Buscando registros - página: ${pagina}, límite: ${limite}`);
    
    const pool = await getConnection();
    const offset = (pagina - 1) * limite;
    
    // Consulta temporal para ver total
    const totalQuery = await pool.request()
      .query('SELECT COUNT(*) as Total FROM RegistrosAsistencia');
    console.log(`📊 Total en BD: ${totalQuery.recordset[0].Total}`);
    
    const result = await pool.request()
      .input('Offset', TYPES.Int, offset)
      .input('Limite', TYPES.Int, limite)
      .query(`
        SELECT * FROM RegistrosAsistencia 
        ORDER BY Fecha DESC
        OFFSET @Offset ROWS
        FETCH NEXT @Limite ROWS ONLY
      `);
    
    console.log(`✅ Registros encontrados: ${result.recordset.length}`);
    
    return {
      data: result.recordset,
      total: totalQuery.recordset[0].Total,
      pagina: parseInt(pagina),
      limite: parseInt(limite)
    };
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

  /**
   * Buscar registros pendientes (solo no procesados)
   */
  async findSoloPendientes(pagina = 1, limite = 20) {
    try {
      const pool = await getConnection();
      const offset = (pagina - 1) * limite;
      
      const result = await pool.request()
        .input('Offset', TYPES.Int, offset)
        .input('Limite', TYPES.Int, limite)
        .query(`
          SELECT 
            Id,
            EmpleadoId,
            ImportacionId,
            Fecha,
            CONVERT(VARCHAR(5), HoraEntrada, 108) as HoraEntrada,
            CONVERT(VARCHAR(5), HoraSalida, 108) as HoraSalida,
            TipoRegistro,
            Origen,
            Comentarios,
            FilaExcel,
            Procesado,
            FechaProcesado,
            FechaCreacion,
            UsuarioCreacion,
            FechaActualizacion,
            UsuarioActualizacion
          FROM RegistrosAsistencia 
          WHERE Procesado = 0
          ORDER BY Fecha ASC
          OFFSET @Offset ROWS
          FETCH NEXT @Limite ROWS ONLY
        `);
      
      const countResult = await pool.request()
        .query('SELECT COUNT(*) as Total FROM RegistrosAsistencia WHERE Procesado = 0');
      
      return {
        data: result.recordset.map(row => {
          if (row.HoraEntrada && typeof row.HoraEntrada !== 'string') {
            row.HoraEntrada = row.HoraEntrada.toString().substring(0, 5);
          }
          if (row.HoraSalida && typeof row.HoraSalida !== 'string') {
            row.HoraSalida = row.HoraSalida.toString().substring(0, 5);
          }
          return new RegistroAsistencia(row);
        }),
        total: countResult.recordset[0].Total,
        pagina: parseInt(pagina),
        limite: parseInt(limite)
      };
    } catch (error) {
      throw new Error(`Error al buscar registros pendientes: ${error.message}`);
    }
  }

  /**
   * Buscar registros por fecha
   */
  async findByFecha(fecha, pagina = 1, limite = 20) {
    try {
      const pool = await getConnection();
      const offset = (pagina - 1) * limite;
      
      const result = await pool.request()
        .input('Fecha', TYPES.Date, fecha)
        .input('Offset', TYPES.Int, offset)
        .input('Limite', TYPES.Int, limite)
        .query(`
          SELECT 
            Id,
            EmpleadoId,
            ImportacionId,
            Fecha,
            CONVERT(VARCHAR(5), HoraEntrada, 108) as HoraEntrada,
            CONVERT(VARCHAR(5), HoraSalida, 108) as HoraSalida,
            TipoRegistro,
            Origen,
            Comentarios,
            FilaExcel,
            Procesado,
            FechaProcesado,
            FechaCreacion,
            UsuarioCreacion,
            FechaActualizacion,
            UsuarioActualizacion
          FROM RegistrosAsistencia 
          WHERE Fecha = @Fecha
          ORDER BY EmpleadoId
          OFFSET @Offset ROWS
          FETCH NEXT @Limite ROWS ONLY
        `);
      
      const countResult = await pool.request()
        .input('Fecha', TYPES.Date, fecha)
        .query('SELECT COUNT(*) as Total FROM RegistrosAsistencia WHERE Fecha = @Fecha');
      
      return {
        data: result.recordset.map(row => {
          if (row.HoraEntrada && typeof row.HoraEntrada !== 'string') {
            row.HoraEntrada = row.HoraEntrada.toString().substring(0, 5);
          }
          if (row.HoraSalida && typeof row.HoraSalida !== 'string') {
            row.HoraSalida = row.HoraSalida.toString().substring(0, 5);
          }
          return new RegistroAsistencia(row);
        }),
        total: countResult.recordset[0].Total,
        pagina: parseInt(pagina),
        limite: parseInt(limite)
      };
    } catch (error) {
      throw new Error(`Error al buscar registros por fecha: ${error.message}`);
    }
  }

  /**
   * Buscar registros por rango de fechas
   */
  async findByRangoFechas(fechaInicio, fechaFin, empleadoId = null) {
    try {
      const pool = await getConnection();
      const request = pool.request()
        .input('FechaInicio', TYPES.Date, fechaInicio)
        .input('FechaFin', TYPES.Date, fechaFin);
      
      let query = `
        SELECT 
          Id,
          EmpleadoId,
          ImportacionId,
          Fecha,
          CONVERT(VARCHAR(5), HoraEntrada, 108) as HoraEntrada,
          CONVERT(VARCHAR(5), HoraSalida, 108) as HoraSalida,
          TipoRegistro,
          Origen,
          Comentarios,
          FilaExcel,
          Procesado,
          FechaProcesado,
          FechaCreacion,
          UsuarioCreacion,
          FechaActualizacion,
          UsuarioActualizacion
        FROM RegistrosAsistencia 
        WHERE Fecha BETWEEN @FechaInicio AND @FechaFin
      `;
      
      if (empleadoId) {
        request.input('EmpleadoId', TYPES.Int, empleadoId);
        query += ' AND EmpleadoId = @EmpleadoId';
      }
      
      query += ' ORDER BY Fecha, EmpleadoId';
      
      const result = await request.query(query);
      return result.recordset.map(row => {
        if (row.HoraEntrada && typeof row.HoraEntrada !== 'string') {
          row.HoraEntrada = row.HoraEntrada.toString().substring(0, 5);
        }
        if (row.HoraSalida && typeof row.HoraSalida !== 'string') {
          row.HoraSalida = row.HoraSalida.toString().substring(0, 5);
        }
        return new RegistroAsistencia(row);
      });
    } catch (error) {
      throw new Error(`Error al buscar registros por rango: ${error.message}`);
    }
  }

  /**
   * Buscar registros sin procesar por período
   */
  async findSinProcesar(fechaInicio, fechaFin) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('FechaInicio', TYPES.Date, fechaInicio)
        .input('FechaFin', TYPES.Date, fechaFin)
        .query(`
          SELECT 
            Id,
            EmpleadoId,
            ImportacionId,
            Fecha,
            CONVERT(VARCHAR(5), HoraEntrada, 108) as HoraEntrada,
            CONVERT(VARCHAR(5), HoraSalida, 108) as HoraSalida,
            TipoRegistro,
            Origen,
            Comentarios,
            FilaExcel,
            Procesado,
            FechaProcesado,
            FechaCreacion,
            UsuarioCreacion,
            FechaActualizacion,
            UsuarioActualizacion
          FROM RegistrosAsistencia 
          WHERE Fecha BETWEEN @FechaInicio AND @FechaFin
          AND Procesado = 0
          ORDER BY Fecha, EmpleadoId
        `);
      
      return result.recordset.map(row => {
        if (row.HoraEntrada && typeof row.HoraEntrada !== 'string') {
          row.HoraEntrada = row.HoraEntrada.toString().substring(0, 5);
        }
        if (row.HoraSalida && typeof row.HoraSalida !== 'string') {
          row.HoraSalida = row.HoraSalida.toString().substring(0, 5);
        }
        return new RegistroAsistencia(row);
      });
    } catch (error) {
      throw new Error(`Error al buscar registros sin procesar: ${error.message}`);
    }
  }

  /**
   * Buscar registros con horas inconsistentes
   */
  async findInconsistentes() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            Id,
            EmpleadoId,
            ImportacionId,
            Fecha,
            CONVERT(VARCHAR(5), HoraEntrada, 108) as HoraEntrada,
            CONVERT(VARCHAR(5), HoraSalida, 108) as HoraSalida,
            TipoRegistro,
            Origen,
            Comentarios,
            FilaExcel,
            Procesado,
            FechaProcesado,
            FechaCreacion,
            UsuarioCreacion,
            FechaActualizacion,
            UsuarioActualizacion
          FROM RegistrosAsistencia 
          WHERE HoraEntrada IS NOT NULL 
          AND HoraSalida IS NOT NULL
          AND HoraSalida <= HoraEntrada
          ORDER BY Fecha DESC
        `);
      
      return result.recordset.map(row => {
        if (row.HoraEntrada && typeof row.HoraEntrada !== 'string') {
          row.HoraEntrada = row.HoraEntrada.toString().substring(0, 5);
        }
        if (row.HoraSalida && typeof row.HoraSalida !== 'string') {
          row.HoraSalida = row.HoraSalida.toString().substring(0, 5);
        }
        return new RegistroAsistencia(row);
      });
    } catch (error) {
      throw new Error(`Error al buscar registros inconsistentes: ${error.message}`);
    }
  }

  /**
   * Crear registro manual (sin valores por defecto)
   */
  async crearManual(empleadoId, fecha, horaEntrada, horaSalida, comentarios, usuario) {
    // ✅ NO asignar horas por defecto - respetar lo que viene
    return await this.create({
      EmpleadoId: empleadoId,
      Fecha: fecha,
      HoraEntrada: horaEntrada,  // Puede ser null
      HoraSalida: horaSalida,    // Puede ser null
      TipoRegistro: TIPOS_REGISTRO.MANUAL,
      Origen: ORIGENES_DATOS.MANUAL,
      Comentarios: comentarios,
      UsuarioCreacion: usuario
    });
  }

  /**
   * Crear registros desde importación (respetando horas originales)
   */
  async crearDesdeImportacion(importacionId, registrosData) {
    const resultados = [];
    const errores = [];
    
    for (const data of registrosData) {
      try {
        // ✅ NO asignar horas por defecto - respetar las originales
        const registroData = {
          ...data,
          ImportacionId: importacionId,
          TipoRegistro: TIPOS_REGISTRO.IMPORTADO,
          Origen: ORIGENES_DATOS.EXCEL,
          // Mantener las horas como vienen (pueden ser null)
          HoraEntrada: data.HoraEntrada,
          HoraSalida: data.HoraSalida
        };
        
        // Opcional: agregar comentario si faltan horas
        if (!data.HoraEntrada || !data.HoraSalida) {
          registroData.Comentarios = `Registro con horas incompletas. Entrada: ${data.HoraEntrada || 'N/A'}, Salida: ${data.HoraSalida || 'N/A'}`;
        }
        
        const registro = await this.create(registroData);
        resultados.push(registro);
      } catch (error) {
        errores.push({
          fila: data.FilaExcel,
          error: error.message
        });
      }
    }
    
    return { exitosos: resultados, errores };
  }

  /**
   * Obtener registro por ID (con conversión de hora)
   */
  async findById(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Id', TYPES.Int, id)
        .query(`
          SELECT 
            Id,
            EmpleadoId,
            ImportacionId,
            Fecha,
            CONVERT(VARCHAR(5), HoraEntrada, 108) as HoraEntrada,
            CONVERT(VARCHAR(5), HoraSalida, 108) as HoraSalida,
            TipoRegistro,
            Origen,
            Comentarios,
            FilaExcel,
            Procesado,
            FechaProcesado,
            FechaCreacion,
            UsuarioCreacion,
            FechaActualizacion,
            UsuarioActualizacion
          FROM RegistrosAsistencia 
          WHERE Id = @Id
        `);
      
      if (result.recordset[0]) {
        const row = result.recordset[0];
        if (row.HoraEntrada && typeof row.HoraEntrada !== 'string') {
          row.HoraEntrada = row.HoraEntrada.toString().substring(0, 5);
        }
        if (row.HoraSalida && typeof row.HoraSalida !== 'string') {
          row.HoraSalida = row.HoraSalida.toString().substring(0, 5);
        }
        return new RegistroAsistencia(row);
      }
      return null;
    } catch (error) {
      throw new Error(`Error al obtener registro: ${error.message}`);
    }
  }

  /**
   * Marcar como procesados
   */
  async marcarComoProcesados(ids, usuario = 'SISTEMA') {
    if (!ids.length) return [];
    
    try {
      const pool = await getConnection();
      const idsList = ids.join(',');
      
      const result = await pool.request()
        .input('Usuario', TYPES.NVarChar, usuario)
        .query(`
          UPDATE RegistrosAsistencia 
          SET Procesado = 1,
              FechaProcesado = GETDATE(),
              UsuarioActualizacion = @Usuario
          WHERE Id IN (${idsList})
          OUTPUT 
            INSERTED.Id,
            INSERTED.EmpleadoId,
            INSERTED.ImportacionId,
            INSERTED.Fecha,
            CONVERT(VARCHAR(5), INSERTED.HoraEntrada, 108) as HoraEntrada,
            CONVERT(VARCHAR(5), INSERTED.HoraSalida, 108) as HoraSalida,
            INSERTED.TipoRegistro,
            INSERTED.Origen,
            INSERTED.Comentarios,
            INSERTED.FilaExcel,
            INSERTED.Procesado,
            INSERTED.FechaProcesado,
            INSERTED.FechaCreacion,
            INSERTED.UsuarioCreacion,
            INSERTED.FechaActualizacion,
            INSERTED.UsuarioActualizacion
        `);
      
      return result.recordset.map(row => {
        if (row.HoraEntrada && typeof row.HoraEntrada !== 'string') {
          row.HoraEntrada = row.HoraEntrada.toString().substring(0, 5);
        }
        if (row.HoraSalida && typeof row.HoraSalida !== 'string') {
          row.HoraSalida = row.HoraSalida.toString().substring(0, 5);
        }
        return new RegistroAsistencia(row);
      });
    } catch (error) {
      throw new Error(`Error al marcar como procesados: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas por empleado
   */
  async getEstadisticasPorEmpleado(empleadoId, fechaInicio, fechaFin) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('EmpleadoId', TYPES.Int, empleadoId)
        .input('FechaInicio', TYPES.Date, fechaInicio)
        .input('FechaFin', TYPES.Date, fechaFin)
        .query(`
          SELECT 
            COUNT(*) as TotalRegistros,
            SUM(CASE WHEN HoraEntrada IS NOT NULL AND HoraSalida IS NOT NULL THEN 1 ELSE 0 END) as RegistrosCompletos,
            SUM(CASE WHEN HoraEntrada IS NULL OR HoraSalida IS NULL THEN 1 ELSE 0 END) as RegistrosIncompletos,
            SUM(CASE WHEN Procesado = 1 THEN 1 ELSE 0 END) as Procesados,
            AVG(
              CASE 
                WHEN HoraEntrada IS NOT NULL AND HoraSalida IS NOT NULL 
                THEN DATEDIFF(MINUTE, HoraEntrada, HoraSalida) / 60.0
                ELSE 0 
              END
            ) as PromedioHoras
          FROM RegistrosAsistencia
          WHERE EmpleadoId = @EmpleadoId
          AND Fecha BETWEEN @FechaInicio AND @FechaFin
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * Obtener registros agrupados por fecha
   */
  async getAgrupadoPorFecha(fechaInicio, fechaFin) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('FechaInicio', TYPES.Date, fechaInicio)
        .input('FechaFin', TYPES.Date, fechaFin)
        .query(`
          SELECT 
            Fecha,
            COUNT(*) as TotalRegistros,
            SUM(CASE WHEN HoraEntrada IS NOT NULL AND HoraSalida IS NOT NULL THEN 1 ELSE 0 END) as Completos,
            SUM(CASE WHEN HoraEntrada IS NULL OR HoraSalida IS NULL THEN 1 ELSE 0 END) as Incompletos
          FROM RegistrosAsistencia
          WHERE Fecha BETWEEN @FechaInicio AND @FechaFin
          GROUP BY Fecha
          ORDER BY Fecha
        `);
      
      return result.recordset;
    } catch (error) {
      throw new Error(`Error al obtener registros agrupados: ${error.message}`);
    }
  }

  /**
   * Verificar si existe registro para empleado en fecha
   */
  async existeRegistro(empleadoId, fecha, excludeId = null) {
    try {
      const pool = await getConnection();
      const request = pool.request()
        .input('EmpleadoId', TYPES.Int, empleadoId)
        .input('Fecha', TYPES.Date, fecha);
      
      let query = `
        SELECT COUNT(*) as Total FROM RegistrosAsistencia 
        WHERE EmpleadoId = @EmpleadoId AND Fecha = @Fecha
      `;
      
      if (excludeId) {
        request.input('ExcludeId', TYPES.Int, excludeId);
        query += ' AND Id != @ExcludeId';
      }
      
      const result = await request.query(query);
      return result.recordset[0].Total > 0;
    } catch (error) {
      throw new Error(`Error al verificar existencia: ${error.message}`);
    }
  }

  /**
   * Actualizar registro - SIN valores por defecto
   */
  async update(id, data) {
    // ❌ NO asignar valores por defecto - respetar lo que viene
    return await super.update(id, data);
  }
}

export default new RegistroAsistenciaRepository();