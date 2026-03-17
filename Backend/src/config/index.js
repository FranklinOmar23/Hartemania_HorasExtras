// src/config/index.js
export { default as env, isDevelopment, isProduction, isTest } from './environment.js';
export { default as database, getConnection, withTransaction, closeConnection, executeQuery, TYPES } from './database.js';
export { default as constants, HTTP_STATUS, TIPOS_JORNADA, TIPOS_HORAS_EXTRAS, LIMITES_LEGALES } from '../utils/constants.js';