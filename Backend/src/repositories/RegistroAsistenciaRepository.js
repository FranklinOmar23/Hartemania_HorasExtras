// src/repositories/RegistroAsistenciaRepository.js
import BaseRepository from './BaseRepository.js';
import RegistroAsistencia from '../models/RegistroAsistencia.model.js';
import { getConnection, TYPES } from '../config/database.js';
import { TIPOS_REGISTRO, ORIGENES_DATOS } from '../utils/constants.js';

class RegistroAsistenciaRepository extends BaseRepository {
  constructor() {
    super('RegistrosAsistencia', RegistroAsistencia);
  }

  async findAllFiltered(filtros = {}) {
    try {
      const pagina = Math.max(parseInt(filtros.pagina, 10) || 1, 1);
      const limite = Math.min(Math.max(parseInt(filtros.limite, 10) || 20, 1), 100);
      const offset = (pagina - 1) * limite;

      const pool = await getConnection();
      const request = pool.request()
        .input('Offset', TYPES.Int, offset)
        .input('Limite', TYPES.Int, limite);

      const where = ['1 = 1'];

      if (filtros.fechaInicio) {
        request.input('FechaInicio', TYPES.NVarChar, filtros.fechaInicio);
        where.push('CONVERT(VARCHAR(10), ra.Fecha, 23) >= @FechaInicio');
      }

      if (filtros.fechaFin) {
        request.input('FechaFin', TYPES.NVarChar, filtros.fechaFin);
        where.push('CONVERT(VARCHAR(10), ra.Fecha, 23) <= @FechaFin');
      }

      if (filtros.fecha) {
        request.input('Fecha', TYPES.NVarChar, filtros.fecha);
        where.push('CONVERT(VARCHAR(10), ra.Fecha, 23) = @Fecha');
      }

      if (filtros.tipo) {
        request.input('TipoRegistro', TYPES.NVarChar, filtros.tipo);
        where.push('ra.TipoRegistro = @TipoRegistro');
      }

      if (filtros.search) {
        request.input('Search', TYPES.NVarChar, `%${String(filtros.search).trim()}%`);
        where.push(`(
          e.Codigo LIKE @Search
          OR e.Nombre LIKE @Search
          OR e.Apellido LIKE @Search
          OR CONCAT(e.Nombre, ' ', e.Apellido) LIKE @Search
        )`);
      }

      if (filtros.empleadoId) {
        const empleadoFiltro = String(filtros.empleadoId).trim();
        if (/^\d+$/.test(empleadoFiltro)) {
          request.input('EmpleadoId', TYPES.Int, parseInt(empleadoFiltro, 10));
          where.push('ra.EmpleadoId = @EmpleadoId');
        } else {
          request.input('EmpleadoFiltro', TYPES.NVarChar, `%${empleadoFiltro}%`);
          where.push(`(
            e.Codigo LIKE @EmpleadoFiltro
            OR e.Nombre LIKE @EmpleadoFiltro
            OR e.Apellido LIKE @EmpleadoFiltro
            OR CONCAT(e.Nombre, ' ', e.Apellido) LIKE @EmpleadoFiltro
          )`);
        }
      }

      const whereClause = where.join(' AND ');
      const fromClause = `
        FROM RegistrosAsistencia ra
        INNER JOIN Empleados e ON e.Id = ra.EmpleadoId
        LEFT JOIN (
          SELECT
            ch.RegistroAsistenciaId,
            SUM(CASE WHEN th.Codigo = '35%' THEN ch.Horas ELSE 0 END) as he35,
            SUM(CASE WHEN th.Codigo = '100%' THEN ch.Horas ELSE 0 END) as he100,
            SUM(CASE WHEN th.Codigo = '15%' THEN ch.Horas ELSE 0 END) as he15,
            SUM(CASE WHEN th.Codigo = 'FERIADO' THEN ch.Horas ELSE 0 END) as heFeriado,
            SUM(ch.Horas) as totalHoras,
            SUM(ch.Monto) as totalPagar
          FROM CalculosHorasExtras ch
          INNER JOIN TiposHorasExtras th ON th.Id = ch.TipoHEId
          GROUP BY ch.RegistroAsistenciaId
        ) calc ON calc.RegistroAsistenciaId = ra.Id
      `;

      const countResult = await request.query(`
        SELECT COUNT(*) as Total
        ${fromClause}
        WHERE ${whereClause}
      `);

      const dataResult = await request.query(`
        SELECT
          ra.Id as id,
          ra.EmpleadoId as empleadoId,
          ra.ImportacionId as importacionId,
          ra.Fecha as fecha,
          CONVERT(VARCHAR(5), ra.HoraEntrada, 108) as horaEntrada,
          CONVERT(VARCHAR(5), ra.HoraSalida, 108) as horaSalida,
          ra.TipoRegistro as tipoRegistro,
          ra.Origen as origen,
          ra.Comentarios as comentarios,
          ra.FilaExcel as filaExcel,
          CAST(ra.Procesado as bit) as procesado,
          ra.FechaProcesado as fechaProcesado,
          ra.FechaCreacion as fechaCreacion,
          ra.FechaActualizacion as fechaActualizacion,
          CONCAT(e.Nombre, ' ', e.Apellido) as empleadoNombre,
          e.Codigo as codigoEmpleado,
          ISNULL(calc.he35, 0) as he35,
          ISNULL(calc.he100, 0) as he100,
          ISNULL(calc.he15, 0) as he15,
          ISNULL(calc.heFeriado, 0) as heFeriado,
          ISNULL(calc.totalHoras, 0) as totalHoras,
          ISNULL(calc.totalPagar, 0) as totalPagar
        ${fromClause}
        WHERE ${whereClause}
        ORDER BY ra.Fecha DESC, ra.Id DESC
        OFFSET @Offset ROWS
        FETCH NEXT @Limite ROWS ONLY
      `);

      return {
        data: dataResult.recordset,
        total: countResult.recordset[0]?.Total || 0,
        pagina,
        limite,
        pages: Math.max(Math.ceil((countResult.recordset[0]?.Total || 0) / limite), 1)
      };
    } catch (error) {
      throw new Error(`Error al listar registros: ${error.message}`);
    }
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
        request.input('FechaInicio', TYPES.NVarChar, fechaInicio);
        query += ' AND CONVERT(VARCHAR(10), Fecha, 23) >= @FechaInicio';
      }
      
      if (fechaFin) {
        request.input('FechaFin', TYPES.NVarChar, fechaFin);
        query += ' AND CONVERT(VARCHAR(10), Fecha, 23) <= @FechaFin';
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
  async findPendientes(pagina = 1, limite = 20) {
    try {
      const pool = await getConnection();
      const offset = (pagina - 1) * limite;
      
      const countResult = await pool.request()
        .query('SELECT COUNT(*) as Total FROM RegistrosAsistencia');
      
      const result = await pool.request()
        .input('Offset', TYPES.Int, offset)
        .input('Limite', TYPES.Int, limite)
        .query(`
          SELECT 
            Id, EmpleadoId, ImportacionId, Fecha,
            CONVERT(VARCHAR(5), HoraEntrada, 108) as HoraEntrada,
            CONVERT(VARCHAR(5), HoraSalida, 108) as HoraSalida,
            TipoRegistro, Origen, Comentarios, FilaExcel,
            Procesado, FechaProcesado, FechaCreacion,
            UsuarioCreacion, FechaActualizacion, UsuarioActualizacion
          FROM RegistrosAsistencia 
          ORDER BY Fecha DESC
          OFFSET @Offset ROWS
          FETCH NEXT @Limite ROWS ONLY
        `);
      
      return {
        data: result.recordset.map(row => new RegistroAsistencia(row)),
        total: countResult.recordset[0].Total,
        pagina: parseInt(pagina),
        limite: parseInt(limite)
      };
    } catch (error) {
      throw new Error(`Error al buscar registros: ${error.message}`);
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
        .input('Fecha', TYPES.NVarChar, fecha)
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
          WHERE CONVERT(VARCHAR(10), Fecha, 23) = @Fecha
          ORDER BY EmpleadoId
          OFFSET @Offset ROWS
          FETCH NEXT @Limite ROWS ONLY
        `);
      
      const countResult = await pool.request()
        .input('Fecha', TYPES.NVarChar, fecha)
        .query('SELECT COUNT(*) as Total FROM RegistrosAsistencia WHERE CONVERT(VARCHAR(10), Fecha, 23) = @Fecha');
      
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
        .input('FechaInicio', TYPES.NVarChar, fechaInicio)
        .input('FechaFin', TYPES.NVarChar, fechaFin);
      
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
        WHERE CONVERT(VARCHAR(10), Fecha, 23) BETWEEN @FechaInicio AND @FechaFin
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
        .input('FechaInicio', TYPES.NVarChar, fechaInicio)
        .input('FechaFin', TYPES.NVarChar, fechaFin)
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
          WHERE CONVERT(VARCHAR(10), Fecha, 23) BETWEEN @FechaInicio AND @FechaFin
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
   * Crear registro manual
   */
  async crearManual(empleadoId, fecha, horaEntrada, horaSalida, comentarios, usuario) {
    return await this.create({
      EmpleadoId: empleadoId,
      Fecha: fecha,
      HoraEntrada: horaEntrada,
      HoraSalida: horaSalida,
      TipoRegistro: TIPOS_REGISTRO.MANUAL,
      Origen: ORIGENES_DATOS.MANUAL,
      Comentarios: comentarios,
      UsuarioCreacion: usuario
    });
  }

  /**
   * Crear registros desde importacion
   */
  async crearDesdeImportacion(importacionId, registrosData) {
    const resultados = [];
    const errores = [];
    
    for (const data of registrosData) {
      try {
        const registroData = {
          ...data,
          ImportacionId: importacionId,
          TipoRegistro: TIPOS_REGISTRO.IMPORTADO,
          Origen: ORIGENES_DATOS.EXCEL,
          HoraEntrada: data.HoraEntrada,
          HoraSalida: data.HoraSalida
        };
        
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
      const request = pool.request();
      request.input('Usuario', TYPES.NVarChar, usuario);
      
      // Parametrizar cada ID para evitar SQL injection
      const idParams = ids.map((id, i) => {
        const paramName = `Id${i}`;
        request.input(paramName, TYPES.Int, id);
        return `@${paramName}`;
      });
      
      const result = await request.query(`
          UPDATE RegistrosAsistencia 
          SET Procesado = 1,
              FechaProcesado = GETDATE(),
              UsuarioActualizacion = @Usuario
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
          WHERE Id IN (${idParams.join(',')})
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
        .input('FechaInicio', TYPES.NVarChar, fechaInicio)
        .input('FechaFin', TYPES.NVarChar, fechaFin)
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
          AND CONVERT(VARCHAR(10), Fecha, 23) BETWEEN @FechaInicio AND @FechaFin
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
        .input('FechaInicio', TYPES.NVarChar, fechaInicio)
        .input('FechaFin', TYPES.NVarChar, fechaFin)
        .query(`
          SELECT 
            Fecha,
            COUNT(*) as TotalRegistros,
            SUM(CASE WHEN HoraEntrada IS NOT NULL AND HoraSalida IS NOT NULL THEN 1 ELSE 0 END) as Completos,
            SUM(CASE WHEN HoraEntrada IS NULL OR HoraSalida IS NULL THEN 1 ELSE 0 END) as Incompletos
          FROM RegistrosAsistencia
          WHERE CONVERT(VARCHAR(10), Fecha, 23) BETWEEN @FechaInicio AND @FechaFin
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
  async deleteByEmpleadoYFecha(empleadoId, fecha) {
    try {
      const pool = await getConnection();
      await pool.request()
        .input('EmpleadoId', TYPES.Int, empleadoId)
        .input('Fecha', TYPES.NVarChar, fecha)
        .query("DELETE FROM RegistrosAsistencia WHERE EmpleadoId = @EmpleadoId AND CONVERT(VARCHAR(10), Fecha, 23) = @Fecha");
    } catch (error) {
      // Ignorar - puede no existir
    }
  }

  async findByEmpleadoYFecha(empleadoId, fecha) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('EmpleadoId', TYPES.Int, empleadoId)
        .input('Fecha', TYPES.NVarChar, fecha)
        .query("SELECT TOP 1 * FROM RegistrosAsistencia WHERE EmpleadoId = @EmpleadoId AND CONVERT(VARCHAR(10), Fecha, 23) = @Fecha");
      return result.recordset[0] || null;
    } catch (error) {
      throw new Error(`Error al buscar registro por empleado y fecha: ${error.message}`);
    }
  }

  async existeRegistro(empleadoId, fecha, excludeId = null) {
    try {
      const pool = await getConnection();
      const request = pool.request()
        .input('EmpleadoId', TYPES.Int, empleadoId)
        .input('Fecha', TYPES.NVarChar, fecha);
      
      let query = `
        SELECT COUNT(*) as Total FROM RegistrosAsistencia 
        WHERE EmpleadoId = @EmpleadoId AND CONVERT(VARCHAR(10), Fecha, 23) = @Fecha
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

}

export default new RegistroAsistenciaRepository();