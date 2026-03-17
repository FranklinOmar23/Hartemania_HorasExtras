// src/repositories/ResumenQuincenalRepository.js
import BaseRepository from './BaseRepository.js';
import ResumenQuincenal from '../models/ResumenQuincenal.model.js';
import { getConnection, TYPES } from '../config/database.js';

class ResumenQuincenalRepository extends BaseRepository {
  constructor() {
    super('ResumenQuincenal', ResumenQuincenal);
  }

  /**
   * Obtener resumen por empleado y período
   */
  async findByEmpleadoYPeriodo(empleadoId, anio, mes, quincena) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('EmpleadoId', TYPES.Int, empleadoId)
        .input('Anio', TYPES.Int, anio)
        .input('Mes', TYPES.Int, mes)
        .input('Quincena', TYPES.Int, quincena)
        .query(`
          SELECT * FROM ResumenQuincenal 
          WHERE EmpleadoId = @EmpleadoId 
            AND Anio = @Anio 
            AND Mes = @Mes 
            AND Quincena = @Quincena
        `);
      
      return result.recordset[0] ? new ResumenQuincenal(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener resumen: ${error.message}`);
    }
  }

  /**
 * Obtener resumen por período con todos los empleados (incluyendo cero horas)
 */
async getResumenCompleto(anio, mes, quincena) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('Anio', TYPES.Int, anio)
      .input('Mes', TYPES.Int, mes)
      .input('Quincena', TYPES.Int, quincena)
      .query(`
        SELECT 
          e.Id as EmpleadoId,
          e.Codigo,
          e.Nombre,
          e.Apellido,
          e.Posicion,
          ISNULL(r.Horas35, 0) as Horas35,
          ISNULL(r.Horas100, 0) as Horas100,
          ISNULL(r.Horas15, 0) as Horas15,
          ISNULL(r.HorasFeriado, 0) as HorasFeriado,
          ISNULL(r.Monto35, 0) as Monto35,
          ISNULL(r.Monto100, 0) as Monto100,
          ISNULL(r.Monto15, 0) as Monto15,
          ISNULL(r.MontoFeriado, 0) as MontoFeriado,
          ISNULL(r.TotalHoras, 0) as TotalHoras,
          ISNULL(r.TotalPagar, 0) as TotalPagar
        FROM Empleados e
        LEFT JOIN ResumenQuincenal r ON 
          r.EmpleadoId = e.Id AND 
          r.Anio = @Anio AND 
          r.Mes = @Mes AND 
          r.Quincena = @Quincena
        WHERE e.Activo = 1
        ORDER BY e.Codigo
      `);
    
    return result.recordset;
  } catch (error) {
    throw new Error(`Error al obtener resumen completo: ${error.message}`);
  }
}

  /**
   * Obtener resúmenes por período
   */
  async findByPeriodo(anio, mes, quincena, incluirEmpleados = false) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Anio', TYPES.Int, anio)
        .input('Mes', TYPES.Int, mes)
        .input('Quincena', TYPES.Int, quincena)
        .query(`
          SELECT * FROM ResumenQuincenal 
          WHERE Anio = @Anio AND Mes = @Mes AND Quincena = @Quincena
          ORDER BY TotalPagar DESC
        `);
      
      const resumenes = result.recordset.map(row => new ResumenQuincenal(row));
      
      if (incluirEmpleados) {
        const EmpleadoRepository = (await import('./EmpleadoRepository.js')).default;
        for (const resumen of resumenes) {
          resumen.Empleado = await EmpleadoRepository.findById(resumen.EmpleadoId);
        }
      }
      
      return resumenes;
    } catch (error) {
      throw new Error(`Error al obtener resúmenes por período: ${error.message}`);
    }
  }

  /**
   * Calcular resumen para un empleado
   */
  async calcularParaEmpleado(empleadoId, anio, mes, quincena) {
    try {
      const pool = await getConnection();
      
      // Ejecutar procedimiento almacenado
      await pool.request()
        .input('EmpleadoId', TYPES.Int, empleadoId)
        .input('Anio', TYPES.Int, anio)
        .input('Mes', TYPES.Int, mes)
        .input('Quincena', TYPES.Int, quincena)
        .execute('sp_CalcularResumenEmpleado');
      
      // Obtener el resultado
      return await this.findByEmpleadoYPeriodo(empleadoId, anio, mes, quincena);
    } catch (error) {
      throw new Error(`Error al calcular resumen: ${error.message}`);
    }
  }

  /**
   * Calcular resúmenes para todos los empleados
   */
  async calcularTodos(anio, mes, quincena) {
    try {
      const EmpleadoRepository = (await import('./EmpleadoRepository.js')).default;
      const empleados = await EmpleadoRepository.findActivos();
      
      const resultados = [];
      for (const empleado of empleados.data) {
        const resumen = await this.calcularParaEmpleado(empleado.Id, anio, mes, quincena);
        if (resumen) resultados.push(resumen);
      }
      
      return resultados;
    } catch (error) {
      throw new Error(`Error al calcular todos los resúmenes: ${error.message}`);
    }
  }

  /**
   * Obtener totales por período
   */
  async getTotalesPorPeriodo(anio, mes, quincena) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Anio', TYPES.Int, anio)
        .input('Mes', TYPES.Int, mes)
        .input('Quincena', TYPES.Int, quincena)
        .query(`
          SELECT 
            COUNT(*) as TotalEmpleados,
            SUM(Horas35) as TotalHoras35,
            SUM(Horas100) as TotalHoras100,
            SUM(Horas15) as TotalHoras15,
            SUM(HorasFeriado) as TotalHorasFeriado,
            SUM(TotalHoras) as TotalHoras,
            SUM(TotalPagar) as TotalPagar,
            AVG(TotalPagar) as PromedioPagar,
            MAX(TotalPagar) as MaxPagar,
            MIN(TotalPagar) as MinPagar
          FROM ResumenQuincenal
          WHERE Anio = @Anio AND Mes = @Mes AND Quincena = @Quincena
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Error al obtener totales: ${error.message}`);
    }
  }

  /**
   * Obtener ranking de empleados por horas extras
   */
  async getRanking(anio, mes, quincena, limite = 10) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Anio', TYPES.Int, anio)
        .input('Mes', TYPES.Int, mes)
        .input('Quincena', TYPES.Int, quincena)
        .input('Limite', TYPES.Int, limite)
        .query(`
          SELECT TOP (@Limite) 
            r.*,
            e.Codigo,
            e.Nombre,
            e.Apellido,
            e.Posicion
          FROM ResumenQuincenal r
          INNER JOIN Empleados e ON r.EmpleadoId = e.Id
          WHERE r.Anio = @Anio AND r.Mes = @Mes AND r.Quincena = @Quincena
          ORDER BY r.TotalHoras DESC
        `);
      
      return result.recordset;
    } catch (error) {
      throw new Error(`Error al obtener ranking: ${error.message}`);
    }
  }

  /**
   * Obtener histórico por empleado
   */
  async getHistoricoEmpleado(empleadoId, limite = 12) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('EmpleadoId', TYPES.Int, empleadoId)
        .input('Limite', TYPES.Int, limite)
        .query(`
          SELECT TOP (@Limite) *
          FROM ResumenQuincenal
          WHERE EmpleadoId = @EmpleadoId
          ORDER BY Anio DESC, Mes DESC, Quincena DESC
        `);
      
      return result.recordset.map(row => new ResumenQuincenal(row));
    } catch (error) {
      throw new Error(`Error al obtener histórico: ${error.message}`);
    }
  }

  /**
   * Obtener resumen anual por empleado
   */
  async getResumenAnual(empleadoId, anio) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('EmpleadoId', TYPES.Int, empleadoId)
        .input('Anio', TYPES.Int, anio)
        .query(`
          SELECT 
            SUM(Horas35) as TotalHoras35,
            SUM(Horas100) as TotalHoras100,
            SUM(Horas15) as TotalHoras15,
            SUM(HorasFeriado) as TotalHorasFeriado,
            SUM(TotalHoras) as TotalHoras,
            SUM(TotalPagar) as TotalPagar,
            AVG(TotalPagar) as PromedioQuincenal,
            COUNT(*) as QuincenasTrabajadas
          FROM ResumenQuincenal
          WHERE EmpleadoId = @EmpleadoId AND Anio = @Anio
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Error al obtener resumen anual: ${error.message}`);
    }
  }

  /**
   * Eliminar resúmenes de un período
   */
  async deleteByPeriodo(anio, mes, quincena) {
    try {
      const pool = await getConnection();
      await pool.request()
        .input('Anio', TYPES.Int, anio)
        .input('Mes', TYPES.Int, mes)
        .input('Quincena', TYPES.Int, quincena)
        .query(`
          DELETE FROM ResumenQuincenal 
          WHERE Anio = @Anio AND Mes = @Mes AND Quincena = @Quincena
        `);
      
      return { success: true, message: 'Resúmenes eliminados' };
    } catch (error) {
      throw new Error(`Error al eliminar resúmenes: ${error.message}`);
    }
  }

  /**
   * Exportar resúmenes a formato para reporte
   */
  async exportarParaReporte(anio, mes, quincena) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Anio', TYPES.Int, anio)
        .input('Mes', TYPES.Int, mes)
        .input('Quincena', TYPES.Int, quincena)
        .query(`
          SELECT 
            e.Codigo,
            e.Nombre + ' ' + e.Apellido as Empleado,
            e.Posicion,
            r.Horas35,
            r.Horas100,
            r.Horas15,
            r.HorasFeriado,
            r.TotalHoras,
            r.Monto35,
            r.Monto100,
            r.Monto15,
            r.MontoFeriado,
            r.TotalPagar
          FROM ResumenQuincenal r
          INNER JOIN Empleados e ON r.EmpleadoId = e.Id
          WHERE r.Anio = @Anio AND r.Mes = @Mes AND r.Quincena = @Quincena
          ORDER BY e.Codigo
        `);
      
      return result.recordset;
    } catch (error) {
      throw new Error(`Error al exportar reporte: ${error.message}`);
    }
  }
}

export default new ResumenQuincenalRepository();