// src/repositories/EmpleadoRepository.js
import BaseRepository from './BaseRepository.js';
import Empleado from '../models/Empleado.model.js';
import { getConnection, TYPES } from '../config/database.js';

class EmpleadoRepository extends BaseRepository {
  constructor() {
    super('Empleados', Empleado);
  }

  /**
   * Buscar empleados activos
   */
  async findActivos(pagina = 1, limite = 20) {
    return await this.findAll('Activo = 1', {}, pagina, limite, 'Codigo');
  }
  /**
 * Obtener todos los empleados activos sin paginación (para mapas y caché)
 */
async findAllActivos() {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT * FROM Empleados 
        WHERE Activo = 1 
        ORDER BY Codigo
      `);
    
    return result.recordset.map(row => new Empleado(row));
  } catch (error) {
    throw new Error(`Error al obtener todos los empleados: ${error.message}`);
  }
}

  /**
   * Buscar empleados inactivos
   */
  async findInactivos(pagina = 1, limite = 20) {
    return await this.findAll('Activo = 0', {}, pagina, limite, 'Codigo');
  }

  /**
   * Buscar por código
   */
  async findByCodigo(codigo) {
    return await this.findOneByField('Codigo', codigo, TYPES.NVarChar);
  }

  /**
   * Buscar por departamento
   */
  async findByDepartamento(departamento) {
    return await this.findByField('Departamento', departamento, TYPES.NVarChar);
  }

  /**
   * Buscar empleados por rango de fechas de ingreso
   */
  async findByFechaIngreso(fechaInicio, fechaFin) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('FechaInicio', TYPES.Date, fechaInicio)
        .input('FechaFin', TYPES.Date, fechaFin)
        .query(`
          SELECT * FROM Empleados 
          WHERE FechaIngreso BETWEEN @FechaInicio AND @FechaFin
          AND Activo = 1
          ORDER BY FechaIngreso
        `);
      
      return result.recordset.map(row => new Empleado(row));
    } catch (error) {
      throw new Error(`Error al buscar por fecha ingreso: ${error.message}`);
    }
  }

  /**
   * Buscar empleados con texto (búsqueda full-text)
   */
  async search(termino, pagina = 1, limite = 20) {
    try {
      const pool = await getConnection();
      const offset = (pagina - 1) * limite;
      
      const result = await pool.request()
        .input('Termino', TYPES.NVarChar, `%${termino}%`)
        .input('Offset', TYPES.Int, offset)
        .input('Limite', TYPES.Int, limite)
        .query(`
          SELECT * FROM Empleados 
          WHERE (Nombre LIKE @Termino OR Apellido LIKE @Termino OR Codigo LIKE @Termino)
          AND Activo = 1
          ORDER BY Nombre
          OFFSET @Offset ROWS
          FETCH NEXT @Limite ROWS ONLY
        `);
      
      const countResult = await pool.request()
        .input('Termino', TYPES.NVarChar, `%${termino}%`)
        .query(`
          SELECT COUNT(*) as Total FROM Empleados 
          WHERE (Nombre LIKE @Termino OR Apellido LIKE @Termino OR Codigo LIKE @Termino)
          AND Activo = 1
        `);
      
      return {
        data: result.recordset.map(row => new Empleado(row)),
        total: countResult.recordset[0].Total,
        pagina,
        limite
      };
    } catch (error) {
      throw new Error(`Error en búsqueda de empleados: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de empleados
   */
  async getEstadisticas() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            COUNT(*) as TotalEmpleados,
            SUM(CASE WHEN Activo = 1 THEN 1 ELSE 0 END) as Activos,
            SUM(CASE WHEN Activo = 0 THEN 1 ELSE 0 END) as Inactivos,
            AVG(SalarioBase) as SalarioPromedio,
            MIN(SalarioBase) as SalarioMinimo,
            MAX(SalarioBase) as SalarioMaximo,
            COUNT(DISTINCT Departamento) as TotalDepartamentos
          FROM Empleados
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * Obtener empleados por tipo de jornada
   */
  async findByTipoJornada(tipoJornada) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('TipoJornada', TYPES.NVarChar, tipoJornada)
        .query(`
          SELECT * FROM Empleados 
          WHERE TipoJornada = @TipoJornada AND Activo = 1
          ORDER BY Codigo
        `);
      
      return result.recordset.map(row => new Empleado(row));
    } catch (error) {
      throw new Error(`Error al buscar por tipo jornada: ${error.message}`);
    }
  }

  /**
   * Verificar si existe código
   */
  async existeCodigo(codigo, excludeId = null) {
    try {
      const pool = await getConnection();
      const request = pool.request()
        .input('Codigo', TYPES.NVarChar, codigo);
      
      let query = 'SELECT COUNT(*) as Total FROM Empleados WHERE Codigo = @Codigo';
      
      if (excludeId) {
        request.input('ExcludeId', TYPES.Int, excludeId);
        query += ' AND Id != @ExcludeId';
      }
      
      const result = await request.query(query);
      return result.recordset[0].Total > 0;
    } catch (error) {
      throw new Error(`Error al verificar código: ${error.message}`);
    }
  }

  /**
   * Actualizar salario masivamente
   */
  async actualizarSalarios(empleadosIds, nuevoSalario, usuario = 'SISTEMA') {
    const transaction = await this.transaction(async (t) => {
      const results = [];
      
      for (const id of empleadosIds) {
        const result = await t.request()
          .input('Id', TYPES.Int, id)
          .input('SalarioBase', TYPES.Decimal(10,2), nuevoSalario)
          .input('Usuario', TYPES.NVarChar, usuario)
          .query(`
            UPDATE Empleados 
            SET SalarioBase = @SalarioBase,
                FechaActualizacion = GETDATE(),
                UsuarioActualizacion = @Usuario
            OUTPUT INSERTED.*
            WHERE Id = @Id
          `);
        
        if (result.recordset[0]) {
          results.push(new Empleado(result.recordset[0]));
        }
      }
      
      return results;
    });
    
    return transaction;
  }
}

export default new EmpleadoRepository();