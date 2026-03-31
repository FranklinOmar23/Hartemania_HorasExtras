// src/repositories/FeriadoRepository.js
import BaseRepository from './BaseRepository.js';
import Feriado from '../models/Feriado.model.js';
import { getConnection, TYPES } from '../config/database.js';
import moment from 'moment';

class FeriadoRepository extends BaseRepository {
  constructor() {
    super('Feriados', Feriado);
  }

  /**
   * Obtener feriados por año
   */
  async findByAnio(anio) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Anio', TYPES.Int, anio)
        .query(`
          SELECT * FROM Feriados 
          WHERE (EsFijo = 1) OR (EsFijo = 0 AND Anio = @Anio)
          AND Activo = 1
          ORDER BY Mes, Dia
        `);
      
      return result.recordset.map(row => new Feriado(row));
    } catch (error) {
      throw new Error(`Error al obtener feriados por año: ${error.message}`);
    }
  }

  /**
   * Verificar si una fecha es feriado
   */
  async esFeriado(fecha) {
    try {
      const date = moment.utc(fecha);
      const dia = date.date();
      const mes = date.month() + 1;
      const anio = date.year();
      
      const pool = await getConnection();
      const result = await pool.request()
        .input('Dia', TYPES.Int, dia)
        .input('Mes', TYPES.Int, mes)
        .input('Anio', TYPES.Int, anio)
        .query(`
          SELECT * FROM Feriados 
          WHERE Activo = 1
          AND (
            (EsFijo = 1 AND Dia = @Dia AND Mes = @Mes)
            OR (EsFijo = 0 AND Anio = @Anio AND Dia = @Dia AND Mes = @Mes)
          )
        `);
      
      return result.recordset[0] ? new Feriado(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al verificar feriado: ${error.message}`);
    }
  }

  /**
   * Obtener próximos feriados
   */
  async getProximosFeriados(limite = 10) {
    try {
      const pool = await getConnection();
      const fechaActual = new Date();
      const anioActual = fechaActual.getFullYear();
      const mesActual = fechaActual.getMonth() + 1;
      const diaActual = fechaActual.getDate();
      
      const result = await pool.request()
        .input('AnioActual', TYPES.Int, anioActual)
        .input('MesActual', TYPES.Int, mesActual)
        .input('DiaActual', TYPES.Int, diaActual)
        .input('Limite', TYPES.Int, limite)
        .query(`
          SELECT * FROM (
            SELECT 
              Nombre,
              Dia,
              Mes,
              Anio,
              EsFijo,
              DATEFROMPARTS(
                CASE 
                  WHEN EsFijo = 1 AND (Mes > @MesActual OR (Mes = @MesActual AND Dia >= @DiaActual)) THEN @AnioActual
                  WHEN EsFijo = 1 THEN @AnioActual + 1
                  ELSE Anio
                END,
                Mes,
                Dia
              ) as FechaProximo
            FROM Feriados
            WHERE Activo = 1
          ) as Proximos
          WHERE FechaProximo >= DATEFROMPARTS(@AnioActual, @MesActual, @DiaActual)
          ORDER BY FechaProximo
          OFFSET 0 ROWS
          FETCH NEXT @Limite ROWS ONLY
        `);
      
      return result.recordset;
    } catch (error) {
      throw new Error(`Error al obtener próximos feriados: ${error.message}`);
    }
  }

  /**
   * Obtener feriados por mes
   */
  async findByMes(mes, anio = null) {
    try {
      const pool = await getConnection();
      const request = pool.request()
        .input('Mes', TYPES.Int, mes);
      
      let query = `
        SELECT * FROM Feriados 
        WHERE Mes = @Mes AND Activo = 1
      `;
      
      if (anio) {
        request.input('Anio', TYPES.Int, anio);
        query += ` AND (EsFijo = 1 OR Anio = @Anio)`;
      }
      
      query += ` ORDER BY Dia`;
      
      const result = await request.query(query);
      return result.recordset.map(row => new Feriado(row));
    } catch (error) {
      throw new Error(`Error al obtener feriados por mes: ${error.message}`);
    }
  }

  /**
   * Crear feriado móvil para un año específico
   */
  async crearFeriadoMovil(nombre, dia, mes, anio) {
    return await this.create({
      Nombre: nombre,
      Dia: dia,
      Mes: mes,
      Anio: anio,
      EsFijo: 0,
      AplicaPorcentaje100: 1
    });
  }

  /**
   * Eliminar feriados móviles de un año
   */
  async eliminarFeriadosMoviles(anio) {
    try {
      const pool = await getConnection();
      await pool.request()
        .input('Anio', TYPES.Int, anio)
        .query(`DELETE FROM Feriados WHERE EsFijo = 0 AND Anio = @Anio`);
      
      return { success: true, message: `Feriados móviles de ${anio} eliminados` };
    } catch (error) {
      throw new Error(`Error al eliminar feriados móviles: ${error.message}`);
    }
  }

  /**
   * Obtener calendario completo de feriados para un año
   */
  async getCalendario(anio) {
    const feriadosFijos = await this.findByAnio(anio);
    
    return feriadosFijos.map(f => ({
      fecha: `${anio}-${String(f.Mes).padStart(2, '0')}-${String(f.Dia).padStart(2, '0')}`,
      nombre: f.Nombre,
      esFijo: f.EsFijo,
      aplicaPorcentaje100: f.AplicaPorcentaje100
    }));
  }
}

export default new FeriadoRepository();