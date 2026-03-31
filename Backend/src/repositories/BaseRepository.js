// src/repositories/BaseRepository.js
import { getConnection, executeQuery, TYPES } from '../config/database.js';

class BaseRepository {
  constructor(tableName, modelClass) {
    this.tableName = tableName;
    this.modelClass = modelClass;
  }

  /**
   * Obtener todos los registros con paginacion
   */
  async findAll(where = '', params = {}, pagina = 1, limite = 20, orderBy = 'Id DESC') {
    try {
      const pool = await getConnection();
      const offset = (pagina - 1) * limite;
      
      const whereClause = where ? `WHERE ${where}` : '';

      // Request para datos paginados
      const dataRequest = pool.request();
      Object.entries(params).forEach(([key, value]) => {
        dataRequest.input(key, value);
      });
      dataRequest.input('Offset', TYPES.Int, offset);
      dataRequest.input('Limite', TYPES.Int, limite);
      
      const query = `
        SELECT * FROM ${this.tableName}
        ${whereClause}
        ORDER BY ${orderBy}
        OFFSET @Offset ROWS
        FETCH NEXT @Limite ROWS ONLY
      `;
      const result = await dataRequest.query(query);
      
      // Request separado para el conteo (mssql no permite reusar request)
      const countRequest = pool.request();
      Object.entries(params).forEach(([key, value]) => {
        countRequest.input(key, value);
      });
      const countQuery = `SELECT COUNT(*) as Total FROM ${this.tableName} ${whereClause}`;
      const countResult = await countRequest.query(countQuery);
      
      return {
        data: result.recordset.map(row => new this.modelClass(row)),
        total: countResult.recordset[0].Total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(countResult.recordset[0].Total / limite)
      };
    } catch (error) {
      throw new Error(`Error en findAll de ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Buscar por ID
   */
  async findById(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Id', TYPES.Int, id)
        .query(`SELECT * FROM ${this.tableName} WHERE Id = @Id`);
      
      return result.recordset[0] ? new this.modelClass(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error en findById de ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Buscar por campo específico
   */
  async findByField(field, value, type = TYPES.NVarChar) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Value', type, value)
        .query(`SELECT * FROM ${this.tableName} WHERE ${field} = @Value`);
      
      return result.recordset.map(row => new this.modelClass(row));
    } catch (error) {
      throw new Error(`Error en findByField de ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Buscar uno por campo específico
   */
  async findOneByField(field, value, type = TYPES.NVarChar) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Value', type, value)
        .query(`SELECT TOP 1 * FROM ${this.tableName} WHERE ${field} = @Value`);
      
      return result.recordset[0] ? new this.modelClass(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error en findOneByField de ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Crear nuevo registro
   */
  async create(data) {
    try {
      const pool = await getConnection();
      const request = pool.request();
      
      const campos = Object.keys(data);
      const valores = campos.map(c => `@${c}`).join(', ');
      
      campos.forEach(campo => {
        const valor = data[campo];
        let type = TYPES.NVarChar;
        if (valor === null || valor === undefined) {
          type = TYPES.NVarChar;
        } else if (typeof valor === 'boolean') {
          type = TYPES.Bit;
        } else if (typeof valor === 'number') {
          type = Number.isInteger(valor) ? TYPES.Int : TYPES.Decimal(10, 2);
        } else if (valor instanceof Date) {
          type = TYPES.DateTime;
        }
        request.input(campo, type, valor);
      });
      
      const query = `
        INSERT INTO ${this.tableName} (${campos.join(', ')})
        OUTPUT INSERTED.*
        VALUES (${valores})
      `;
      
      const result = await request.query(query);
      return new this.modelClass(result.recordset[0]);
    } catch (error) {
      throw new Error(`Error en create de ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Actualizar registro
   */
  async update(id, data) {
    try {
      const pool = await getConnection();
      const request = pool.request();
      request.input('Id', TYPES.Int, id);
      
      const updates = [];
      Object.entries(data).forEach(([campo, valor]) => {
        if (valor !== undefined) {
          updates.push(`${campo} = @${campo}`);
          let type = TYPES.NVarChar;
          if (valor === null) {
            type = TYPES.NVarChar;
          } else if (typeof valor === 'boolean') {
            type = TYPES.Bit;
          } else if (typeof valor === 'number') {
            type = Number.isInteger(valor) ? TYPES.Int : TYPES.Decimal(10, 2);
          } else if (valor instanceof Date) {
            type = TYPES.DateTime;
          }
          request.input(campo, type, valor);
        }
      });
      
      const query = `
        UPDATE ${this.tableName}
        SET ${updates.join(', ')}
        OUTPUT INSERTED.*
        WHERE Id = @Id
      `;
      
      const result = await request.query(query);
      return result.recordset[0] ? new this.modelClass(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error en update de ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Eliminar registro (soft delete si softDelete=true, hard delete si false)
   */
  async delete(id, softDelete = true) {
    try {
      const pool = await getConnection();
      
      if (softDelete) {
        const result = await pool.request()
          .input('Id', TYPES.Int, id)
          .query(`UPDATE ${this.tableName} SET Activo = 0 WHERE Id = @Id`);
        
        return { success: true, message: 'Registro desactivado correctamente' };
      } else {
        await pool.request()
          .input('Id', TYPES.Int, id)
          .query(`DELETE FROM ${this.tableName} WHERE Id = @Id`);
        
        return { success: true, message: 'Registro eliminado correctamente' };
      }
    } catch (error) {
      throw new Error(`Error en delete de ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Ejecutar query personalizado
   */
  async executeQuery(query, params = {}) {
    return await executeQuery(query, params);
  }

  /**
   * Iniciar transacción
   */
  async transaction(callback) {
    const pool = await getConnection();
    const transaction = pool.transaction();
    
    try {
      await transaction.begin();
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default BaseRepository;