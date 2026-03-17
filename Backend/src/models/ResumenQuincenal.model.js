// src/models/ResumenQuincenal.model.js
import sql from 'mssql';
import { getConnection } from '../config/database.js';
import { QUINCENAS } from '../utils/constants.js';
import Empleado from './Empleado.model.js';

class ResumenQuincenal {
  constructor(data = {}) {
    this.Id = data.Id;
    this.EmpleadoId = data.EmpleadoId;
    this.Anio = data.Anio;
    this.Mes = data.Mes;
    this.Quincena = data.Quincena;
    this.Horas35 = parseFloat(data.Horas35 || 0);
    this.Horas100 = parseFloat(data.Horas100 || 0);
    this.Horas15 = parseFloat(data.Horas15 || 0);
    this.HorasFeriado = parseFloat(data.HorasFeriado || 0);
    this.Monto35 = parseFloat(data.Monto35 || 0);
    this.Monto100 = parseFloat(data.Monto100 || 0);
    this.Monto15 = parseFloat(data.Monto15 || 0);
    this.MontoFeriado = parseFloat(data.MontoFeriado || 0);
    this.TotalHoras = parseFloat(data.TotalHoras || 0);
    this.TotalPagar = parseFloat(data.TotalPagar || 0);
    this.FechaCalculo = data.FechaCalculo;
    
    // Relaciones
    this.Empleado = null;
  }

  // ============================================
  // CRUD BÁSICO
  // ============================================

  static async obtenerPorEmpleado(empleadoId, anio, mes, quincena) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('EmpleadoId', sql.Int, empleadoId)
        .input('Anio', sql.Int, anio)
        .input('Mes', sql.Int, mes)
        .input('Quincena', sql.Int, quincena)
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

  static async obtenerPorPeriodo(anio, mes, quincena, incluirEmpleados = false) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Anio', sql.Int, anio)
        .input('Mes', sql.Int, mes)
        .input('Quincena', sql.Int, quincena)
        .query(`
          SELECT * FROM ResumenQuincenal 
          WHERE Anio = @Anio AND Mes = @Mes AND Quincena = @Quincena
          ORDER BY TotalPagar DESC
        `);
      
      const resumenes = result.recordset.map(row => new ResumenQuincenal(row));
      
      if (incluirEmpleados) {
        for (const resumen of resumenes) {
          resumen.Empleado = await Empleado.obtenerPorId(resumen.EmpleadoId);
        }
      }
      
      return resumenes;
    } catch (error) {
      throw new Error(`Error al obtener resúmenes: ${error.message}`);
    }
  }

  static async crear(data) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('EmpleadoId', sql.Int, data.EmpleadoId)
        .input('Anio', sql.Int, data.Anio)
        .input('Mes', sql.Int, data.Mes)
        .input('Quincena', sql.Int, data.Quincena)
        .input('Horas35', sql.Decimal(10,2), data.Horas35 || 0)
        .input('Horas100', sql.Decimal(10,2), data.Horas100 || 0)
        .input('Horas15', sql.Decimal(10,2), data.Horas15 || 0)
        .input('HorasFeriado', sql.Decimal(10,2), data.HorasFeriado || 0)
        .input('Monto35', sql.Decimal(10,2), data.Monto35 || 0)
        .input('Monto100', sql.Decimal(10,2), data.Monto100 || 0)
        .input('Monto15', sql.Decimal(10,2), data.Monto15 || 0)
        .input('MontoFeriado', sql.Decimal(10,2), data.MontoFeriado || 0)
        .query(`
          INSERT INTO ResumenQuincenal (
            EmpleadoId, Anio, Mes, Quincena, Horas35, Horas100, Horas15,
            HorasFeriado, Monto35, Monto100, Monto15, MontoFeriado
          )
          OUTPUT INSERTED.*
          VALUES (
            @EmpleadoId, @Anio, @Mes, @Quincena, @Horas35, @Horas100, @Horas15,
            @HorasFeriado, @Monto35, @Monto100, @Monto15, @MontoFeriado
          )
        `);
      
      return new ResumenQuincenal(result.recordset[0]);
    } catch (error) {
      throw new Error(`Error al crear resumen: ${error.message}`);
    }
  }

  static async actualizar(empleadoId, anio, mes, quincena, data) {
    try {
      const pool = await getConnection();
      
      const request = pool.request()
        .input('EmpleadoId', sql.Int, empleadoId)
        .input('Anio', sql.Int, anio)
        .input('Mes', sql.Int, mes)
        .input('Quincena', sql.Int, quincena);
      
      const campos = ['Horas35', 'Horas100', 'Horas15', 'HorasFeriado', 
                      'Monto35', 'Monto100', 'Monto15', 'MontoFeriado'];
      
      const updates = [];
      campos.forEach(campo => {
        if (data[campo] !== undefined) {
          updates.push(`${campo} = @${campo}`);
          request.input(campo, sql.Decimal(10,2), data[campo]);
        }
      });
      
      updates.push('FechaCalculo = GETDATE()');
      
      const query = `
        UPDATE ResumenQuincenal 
        SET ${updates.join(', ')}
        OUTPUT INSERTED.*
        WHERE EmpleadoId = @EmpleadoId AND Anio = @Anio AND Mes = @Mes AND Quincena = @Quincena
      `;
      
      const result = await request.query(query);
      return result.recordset[0] ? new ResumenQuincenal(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al actualizar resumen: ${error.message}`);
    }
  }

  // ============================================
  // MÉTODOS DE CÁLCULO
  // ============================================

  static async calcularDesdeRegistros(empleadoId, anio, mes, quincena) {
    try {
      const pool = await getConnection();
      
      // Ejecutar el procedimiento almacenado
      await pool.request()
        .input('EmpleadoId', sql.Int, empleadoId)
        .input('Anio', sql.Int, anio)
        .input('Mes', sql.Int, mes)
        .input('Quincena', sql.Int, quincena)
        .execute('sp_CalcularResumenEmpleado');
      
      // Obtener el resultado calculado
      return await this.obtenerPorEmpleado(empleadoId, anio, mes, quincena);
    } catch (error) {
      throw new Error(`Error al calcular resumen: ${error.message}`);
    }
  }

  static async calcularTodos(anio, mes, quincena) {
    try {
      const pool = await getConnection();
      
      // Obtener todos los empleados activos
      const empleados = await Empleado.obtenerTodos();
      
      const resultados = [];
      for (const empleado of empleados.data) {
        const resumen = await this.calcularDesdeRegistros(empleado.Id, anio, mes, quincena);
        if (resumen) resultados.push(resumen);
      }
      
      return resultados;
    } catch (error) {
      throw new Error(`Error al calcular todos los resúmenes: ${error.message}`);
    }
  }

  // ============================================
  // MÉTODOS DE ESTADÍSTICAS
  // ============================================

  static async obtenerTotalesPorPeriodo(anio, mes, quincena) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Anio', sql.Int, anio)
        .input('Mes', sql.Int, mes)
        .input('Quincena', sql.Int, quincena)
        .query(`
          SELECT 
            COUNT(*) as TotalEmpleados,
            SUM(Horas35) as TotalHoras35,
            SUM(Horas100) as TotalHoras100,
            SUM(Horas15) as TotalHoras15,
            SUM(HorasFeriado) as TotalHorasFeriado,
            SUM(TotalHoras) as TotalHoras,
            SUM(TotalPagar) as TotalPagar
          FROM ResumenQuincenal
          WHERE Anio = @Anio AND Mes = @Mes AND Quincena = @Quincena
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Error al obtener totales: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.Id,
      empleadoId: this.EmpleadoId,
      empleado: this.Empleado ? this.Empleado.toJSON() : null,
      periodo: {
        anio: this.Anio,
        mes: this.Mes,
        quincena: this.Quincena,
        nombre: `Quincena ${this.Quincena} - ${this.Mes}/${this.Anio}`
      },
      horas: {
        '35%': this.Horas35,
        '100%': this.Horas100,
        '15%': this.Horas15,
        feriado: this.HorasFeriado,
        total: this.TotalHoras
      },
      montos: {
        '35%': this.Monto35,
        '100%': this.Monto100,
        '15%': this.Monto15,
        feriado: this.MontoFeriado,
        total: this.TotalPagar
      },
      fechaCalculo: this.FechaCalculo
    };
  }
}

export default ResumenQuincenal;