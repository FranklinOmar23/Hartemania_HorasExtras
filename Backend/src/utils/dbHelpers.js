// src/utils/dbHelpers.js
import { TYPES } from 'mssql';

class DbHelpers {
  /**
   * Construir cláusula WHERE dinámica
   */
  buildWhereClause(filters, validFields) {
    const conditions = [];
    const params = {};

    for (const [field, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        if (validFields.includes(field)) {
          const paramName = field.replace(/\./g, '_');
          
          if (Array.isArray(value)) {
            // IN clause
            const placeholders = value.map((_, idx) => `@${paramName}_${idx}`).join(',');
            conditions.push(`${field} IN (${placeholders})`);
            value.forEach((v, idx) => {
              params[`${paramName}_${idx}`] = v;
            });
          } else if (typeof value === 'object' && value.operator) {
            // Operadores personalizados (>, <, >=, <=, LIKE)
            const operator = value.operator;
            const paramValue = value.value;
            const paramName = `${field}_${operator}`;
            
            conditions.push(`${field} ${operator} @${paramName}`);
            params[paramName] = paramValue;
          } else {
            // Igualdad simple
            conditions.push(`${field} = @${paramName}`);
            params[paramName] = value;
          }
        }
      }
    }

    return {
      where: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
      params
    };
  }

  /**
   * Construir cláusula ORDER BY
   */
  buildOrderBy(sort, validFields, defaultSort = 'Id DESC') {
    if (!sort) return `ORDER BY ${defaultSort}`;

    const orders = [];
    const sortFields = sort.split(',');

    for (const field of sortFields) {
      const [fieldName, direction] = field.trim().split(':');
      const cleanDirection = direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      
      if (validFields.includes(fieldName)) {
        orders.push(`${fieldName} ${cleanDirection}`);
      }
    }

    return orders.length > 0 
      ? `ORDER BY ${orders.join(', ')}` 
      : `ORDER BY ${defaultSort}`;
  }

  /**
   * Construir cláusula de paginación
   */
  buildPagination(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return {
      offset,
      limit,
      clause: `OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`
    };
  }

  /**
   * Obtener tipo SQL para un valor
   */
  getSqlType(value) {
    if (value === null || value === undefined) {
      return TYPES.NVarChar;
    }

    switch (typeof value) {
      case 'number':
        return Number.isInteger(value) ? TYPES.Int : TYPES.Decimal(10, 2);
      case 'boolean':
        return TYPES.Bit;
      case 'string':
        if (this.isDate(value)) {
          return TYPES.Date;
        }
        if (this.isDateTime(value)) {
          return TYPES.DateTime;
        }
        return TYPES.NVarChar;
      default:
        return TYPES.NVarChar;
    }
  }

  /**
   * Verificar si es fecha
   */
  isDate(value) {
    if (typeof value !== 'string') return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  /**
   * Verificar si es fecha y hora
   */
  isDateTime(value) {
    if (typeof value !== 'string') return false;
    return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value);
  }

  /**
   * Sanitizar nombre de tabla/columna
   */
  sanitizeIdentifier(name) {
    // Eliminar caracteres peligrosos
    return name.replace(/[^a-zA-Z0-9_]/g, '');
  }

  /**
   * Escapar valor para LIKE
   */
  escapeLike(value) {
    return value.replace(/[%_]/g, '\\$&');
  }

  /**
   * Construir query de búsqueda full-text
   */
  buildSearchQuery(searchTerm, fields) {
    const conditions = fields.map(field => {
      return `${field} LIKE @SearchTerm`;
    });
    
    return {
      where: `WHERE (${conditions.join(' OR ')})`,
      params: {
        SearchTerm: `%${this.escapeLike(searchTerm)}%`
      }
    };
  }

  /**
   * Obtener nombre de columna para ordenamiento
   */
  getSortColumn(sortField, validFields) {
    if (validFields.includes(sortField)) {
      return sortField;
    }
    return validFields[0] || 'Id';
  }

  /**
   * Formatear resultados para respuesta
   */
  formatResults(data, total, page, limit) {
    return {
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Generar placeholders para INSERT masivo
   */
  generateBulkInsertPlaceholders(items, fields) {
    const placeholders = [];
    
    for (let i = 0; i < items.length; i++) {
      const rowPlaceholders = fields.map(field => `@${field}_${i}`).join(', ');
      placeholders.push(`(${rowPlaceholders})`);
    }
    
    return placeholders.join(', ');
  }

  /**
   * Generar parámetros para INSERT masivo
   */
  generateBulkInsertParams(items, fields) {
    const params = {};
    
    for (let i = 0; i < items.length; i++) {
      for (const field of fields) {
        params[`${field}_${i}`] = items[i][field];
      }
    }
    
    return params;
  }

  /**
   * Obtener fecha actual del servidor
   */
  getServerDate() {
    return new Date();
  }

  /**
   * Formatear fecha para SQL Server
   */
  formatDateForSql(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  /**
   * Formatear datetime para SQL Server
   */
  formatDateTimeForSql(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().replace('T', ' ').substring(0, 19);
  }
}

export default new DbHelpers();