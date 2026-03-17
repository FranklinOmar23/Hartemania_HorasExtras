// src/repositories/TipoHoraExtraRepository.js
import BaseRepository from './BaseRepository.js';
import TipoHoraExtra from '../models/TipoHoraExtra.model.js';
import { getConnection, TYPES } from '../config/database.js';

class TipoHoraExtraRepository extends BaseRepository {
  constructor() {
    super('TiposHorasExtras', TipoHoraExtra);
  }

  /**
   * Obtener tipos de horas extras activos
   */
  async findActivos() {
    return await this.findAll('Activo = 1', {}, 1, 100, 'Orden');
  }

  /**
   * Obtener tipo por código
   */
  async findByCodigo(codigo) {
    return await this.findOneByField('Codigo', codigo, TYPES.NVarChar);
  }

  /**
   * Obtener tipos que aplican para fin de semana
   */
  async findParaFinSemana() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT * FROM TiposHorasExtras 
          WHERE Activo = 1 AND AplicaFinSemana = 1
          ORDER BY Orden
        `);
      
      return result.recordset.map(row => new TipoHoraExtra(row));
    } catch (error) {
      throw new Error(`Error al obtener tipos para fin de semana: ${error.message}`);
    }
  }

  /**
   * Obtener tipos que aplican para feriados
   */
  async findParaFeriados() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT * FROM TiposHorasExtras 
          WHERE Activo = 1 AND AplicaFeriados = 1
          ORDER BY Orden
        `);
      
      return result.recordset.map(row => new TipoHoraExtra(row));
    } catch (error) {
      throw new Error(`Error al obtener tipos para feriados: ${error.message}`);
    }
  }

  /**
   * Obtener tipos que aplican para horas nocturnas
   */
  async findParaNocturnas() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT * FROM TiposHorasExtras 
          WHERE Activo = 1 AND AplicaNocturno = 1
          ORDER BY Orden
        `);
      
      return result.recordset.map(row => new TipoHoraExtra(row));
    } catch (error) {
      throw new Error(`Error al obtener tipos para nocturnas: ${error.message}`);
    }
  }

  /**
   * Obtener tipos por día (según si es fin de semana o feriado)
   */
  async findByTipoDia(esFinSemana = false, esFeriado = false) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('EsFinSemana', TYPES.Bit, esFinSemana)
        .input('EsFeriado', TYPES.Bit, esFeriado)
        .query(`
          SELECT * FROM TiposHorasExtras 
          WHERE Activo = 1
          AND (
            (AplicaFinSemana = 1 AND @EsFinSemana = 1)
            OR (AplicaFeriados = 1 AND @EsFeriado = 1)
            OR (AplicaFinSemana = 0 AND AplicaFeriados = 0)
          )
          ORDER BY Orden
        `);
      
      return result.recordset.map(row => new TipoHoraExtra(row));
    } catch (error) {
      throw new Error(`Error al obtener tipos por día: ${error.message}`);
    }
  }

  /**
   * Crear tipo de hora extra
   */
  async crearTipo(data) {
    return await this.create({
      Codigo: data.codigo,
      Descripcion: data.descripcion,
      Porcentaje: data.porcentaje,
      FactorMultiplicador: data.factorMultiplicador || (1 + data.porcentaje / 100),
      ColorHex: data.colorHex,
      Orden: data.orden || 0,
      AplicaFinSemana: data.aplicaFinSemana || 0,
      AplicaFeriados: data.aplicaFeriados || 0,
      AplicaNocturno: data.aplicaNocturno || 0,
      Activo: data.activo !== undefined ? data.activo : 1
    });
  }

  /**
   * Actualizar factor multiplicador
   */
  async actualizarFactor(id, factor) {
    return await this.update(id, {
      FactorMultiplicador: factor
    });
  }

  /**
   * Obtener factor para cálculo
   */
  async getFactorByCodigo(codigo) {
    const tipo = await this.findByCodigo(codigo);
    return tipo ? tipo.FactorMultiplicador : 1;
  }
}

export default new TipoHoraExtraRepository();