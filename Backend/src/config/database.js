// src/config/database.js
import sql from 'mssql';
import { env, isDevelopment } from './environment.js';

// Configuración de conexión a SQL Server
const dbConfig = {
  server: env.DB.SERVER,
  port: env.DB.PORT,
  database: env.DB.NAME,
  user: env.DB.USER,
  password: env.DB.PASSWORD,
  options: {
    encrypt: env.DB.ENCRYPT,
    trustServerCertificate: env.DB.TRUST_SERVER_CERTIFICATE,
    connectionTimeout: env.DB.CONNECTION_TIMEOUT,
    enableArithAbort: true,
    // Para manejar fechas correctamente
    useUTC: false
  },
  pool: {
    max: env.DB.POOL_MAX,
    min: env.DB.POOL_MIN,
    idleTimeoutMillis: env.DB.POOL_IDLE
  }
};

// Pool de conexiones
let pool = null;

/**
 * Obtiene una conexión del pool
 * @returns {Promise<sql.ConnectionPool>}
 */
export async function getConnection() {
  try {
    if (pool) {
      // Verificar si la conexión está viva
      try {
        await pool.request().query('SELECT 1');
        return pool;
      } catch (err) {
        console.warn('⚠️ Pool desconectado, reconectando...');
        pool = null;
      }
    }
    
    console.log('🔄 Conectando a SQL Server...');
    pool = await sql.connect(dbConfig);
    
    if (isDevelopment()) {
      console.log('✅ Conectado a SQL Server:', {
        server: env.DB.SERVER,
        database: env.DB.NAME,
        user: env.DB.USER
      });
    } else {
      console.log('✅ Conectado a SQL Server');
    }
    
    return pool;
  } catch (error) {
    console.error('❌ Error conectando a SQL Server:', {
      message: error.message,
      code: error.code,
      server: env.DB.SERVER,
      database: env.DB.NAME
    });
    throw error;
  }
}

/**
 * Ejecuta una transacción
 * @param {Function} callback - Función que recibe la transacción
 * @returns {Promise<any>}
 */
export async function withTransaction(callback) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  
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

/**
 * Cierra todas las conexiones
 */
export async function closeConnection() {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('🔌 Conexiones cerradas');
    }
  } catch (error) {
    console.error('Error cerrando conexiones:', error);
  }
}

/**
 * Ejecuta una consulta con logging
 * @param {string} query - Consulta SQL
 * @param {Object} params - Parámetros de la consulta
 * @returns {Promise<sql.IResult>}
 */
export async function executeQuery(query, params = {}) {
  const pool = await getConnection();
  const request = pool.request();
  
  // Agregar parámetros
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });
  
  if (isDevelopment()) {
    console.log('📝 Query:', query.substring(0, 200) + (query.length > 200 ? '...' : ''));
  }
  
  try {
    const result = await request.query(query);
    return result;
  } catch (error) {
    console.error('❌ Error en query:', {
      error: error.message,
      query: query.substring(0, 200)
    });
    throw error;
  }
}

// Tipos de datos SQL para usar en consultas
export const TYPES = sql.TYPES;

export default {
  getConnection,
  withTransaction,
  closeConnection,
  executeQuery,
  TYPES
};