// src/models/Empleado.model.js
import sql from 'mssql';
import { getConnection } from '../config/database.js';
import { TIPOS_JORNADA } from '../utils/constants.js';

class Empleado {
  constructor(data = {}) {
    this.Id = data.Id;
    this.Codigo = data.Codigo;
    this.Nombre = data.Nombre;
    this.Apellido = data.Apellido;
    this.NombreCompleto = data.Nombre && data.Apellido ? `${data.Nombre} ${data.Apellido}` : '';
    this.Posicion = data.Posicion;
    this.Departamento = data.Departamento;
    this.SalarioBase = data.SalarioBase ? parseFloat(data.SalarioBase) : 0;
    this.SalarioDiario = data.SalarioDiario ? parseFloat(data.SalarioDiario) : 0;
    this.SalarioPorHora = data.SalarioPorHora ? parseFloat(data.SalarioPorHora) : 0;
    this.FechaIngreso = data.FechaIngreso;
    this.TipoJornada = data.TipoJornada || TIPOS_JORNADA.DIURNA;
    this.Activo = data.Activo !== undefined ? data.Activo : 1;
    this.FechaCreacion = data.FechaCreacion;
    this.FechaActualizacion = data.FechaActualizacion;
    this.UsuarioCreacion = data.UsuarioCreacion;
    this.UsuarioActualizacion = data.UsuarioActualizacion;
  }

  // ============================================
  // CRUD BÁSICO
  // ============================================

  static async obtenerTodos(activo = true, pagina = 1, limite = 20) {
    try {
      const pool = await getConnection();
      const offset = (pagina - 1) * limite;
      
      const result = await pool.request()
        .input('Activo', sql.Bit, activo)
        .input('Offset', sql.Int, offset)
        .input('Limite', sql.Int, limite)
        .query(`
          SELECT * FROM Empleados 
          WHERE Activo = @Activo 
          ORDER BY Codigo
          OFFSET @Offset ROWS
          FETCH NEXT @Limite ROWS ONLY
        `);
      
      // Obtener total de registros
      const countResult = await pool.request()
        .input('Activo', sql.Bit, activo)
        .query('SELECT COUNT(*) as Total FROM Empleados WHERE Activo = @Activo');
      
      return {
        data: result.recordset.map(row => new Empleado(row)),
        total: countResult.recordset[0].Total
      };
    } catch (error) {
      throw new Error(`Error al obtener empleados: ${error.message}`);
    }
  }

  static async obtenerPorId(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Id', sql.Int, id)
        .query('SELECT * FROM Empleados WHERE Id = @Id');
      
      return result.recordset[0] ? new Empleado(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener empleado: ${error.message}`);
    }
  }

  static async obtenerPorCodigo(codigo) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Codigo', sql.NVarChar, codigo)
        .query('SELECT * FROM Empleados WHERE Codigo = @Codigo');
      
      return result.recordset[0] ? new Empleado(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener empleado por código: ${error.message}`);
    }
  }

  static async crear(empleadoData) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Codigo', sql.NVarChar, empleadoData.Codigo)
        .input('Nombre', sql.NVarChar, empleadoData.Nombre)
        .input('Apellido', sql.NVarChar, empleadoData.Apellido)
        .input('Posicion', sql.NVarChar, empleadoData.Posicion || null)
        .input('Departamento', sql.NVarChar, empleadoData.Departamento || null)
        .input('SalarioBase', sql.Decimal(10,2), empleadoData.SalarioBase)
        .input('FechaIngreso', sql.Date, empleadoData.FechaIngreso || null)
        .input('TipoJornada', sql.NVarChar, empleadoData.TipoJornada || TIPOS_JORNADA.DIURNA)
        .input('UsuarioCreacion', sql.NVarChar, empleadoData.UsuarioCreacion || 'SISTEMA')
        .query(`
          INSERT INTO Empleados (
            Codigo, Nombre, Apellido, Posicion, Departamento, 
            SalarioBase, FechaIngreso, TipoJornada, UsuarioCreacion
          )
          OUTPUT INSERTED.*
          VALUES (
            @Codigo, @Nombre, @Apellido, @Posicion, @Departamento,
            @SalarioBase, @FechaIngreso, @TipoJornada, @UsuarioCreacion
          )
        `);
      
      return new Empleado(result.recordset[0]);
    } catch (error) {
      if (error.number === 2627) { // Violación de unique constraint
        throw new Error(`Ya existe un empleado con el código ${empleadoData.Codigo}`);
      }
      throw new Error(`Error al crear empleado: ${error.message}`);
    }
  }

  static async actualizar(id, empleadoData) {
    try {
      const pool = await getConnection();
      
      const camposActualizables = [
        'Codigo', 'Nombre', 'Apellido', 'Posicion', 'Departamento',
        'SalarioBase', 'FechaIngreso', 'TipoJornada', 'Activo'
      ];
      
      const request = pool.request();
      request.input('Id', sql.Int, id);
      
      const updates = [];
      camposActualizables.forEach(campo => {
        if (empleadoData[campo] !== undefined) {
          updates.push(`${campo} = @${campo}`);
          let type = sql.NVarChar;
          if (campo === 'SalarioBase') type = sql.Decimal(10,2);
          else if (campo === 'FechaIngreso') type = sql.Date;
          else if (campo === 'Activo') type = sql.Bit;
          request.input(campo, type, empleadoData[campo]);
        }
      });
      
      updates.push('FechaActualizacion = GETDATE()');
      request.input('UsuarioActualizacion', sql.NVarChar, empleadoData.UsuarioActualizacion || 'SISTEMA');
      updates.push('UsuarioActualizacion = @UsuarioActualizacion');
      
      const query = `
        UPDATE Empleados 
        SET ${updates.join(', ')}
        OUTPUT INSERTED.*
        WHERE Id = @Id
      `;
      
      const result = await request.query(query);
      return result.recordset[0] ? new Empleado(result.recordset[0]) : null;
    } catch (error) {
      throw new Error(`Error al actualizar empleado: ${error.message}`);
    }
  }

  static async eliminar(id, usuario = 'SISTEMA') {
    try {
      const pool = await getConnection();
      await pool.request()
        .input('Id', sql.Int, id)
        .input('Usuario', sql.NVarChar, usuario)
        .query(`
          UPDATE Empleados 
          SET Activo = 0, 
              FechaActualizacion = GETDATE(),
              UsuarioActualizacion = @Usuario
          WHERE Id = @Id
        `);
      
      return { success: true, message: 'Empleado eliminado correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar empleado: ${error.message}`);
    }
  }

  static async eliminarFisico(id) {
    try {
      const pool = await getConnection();
      await pool.request()
        .input('Id', sql.Int, id)
        .query('DELETE FROM Empleados WHERE Id = @Id');
      
      return { success: true, message: 'Empleado eliminado físicamente' };
    } catch (error) {
      throw new Error(`Error al eliminar empleado: ${error.message}`);
    }
  }

  // ============================================
  // MÉTODOS DE BÚSQUEDA
  // ============================================

  static async buscar(termino, limite = 20) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Termino', sql.NVarChar, `%${termino}%`)
        .input('Limite', sql.Int, limite)
        .query(`
          SELECT TOP (@Limite) * FROM Empleados 
          WHERE (Nombre LIKE @Termino OR Apellido LIKE @Termino OR Codigo LIKE @Termino)
          AND Activo = 1
          ORDER BY Nombre
        `);
      
      return result.recordset.map(row => new Empleado(row));
    } catch (error) {
      throw new Error(`Error al buscar empleados: ${error.message}`);
    }
  }

  static async obtenerPorDepartamento(departamento) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Departamento', sql.NVarChar, departamento)
        .query(`
          SELECT * FROM Empleados 
          WHERE Departamento = @Departamento AND Activo = 1
          ORDER BY Nombre
        `);
      
      return result.recordset.map(row => new Empleado(row));
    } catch (error) {
      throw new Error(`Error al obtener empleados por departamento: ${error.message}`);
    }
  }

  // ============================================
  // MÉTODOS DE CÁLCULO
  // ============================================

  calcularValorHora() {
    return this.SalarioBase / 23.83 / 8;
  }

  calcularValorHoraExtra(tipoHora) {
    const valorHora = this.calcularValorHora();
    return valorHora * tipoHora.FactorMultiplicador;
  }

  // ============================================
  // VALIDACIONES
  // ============================================

  validarSalario() {
    return this.SalarioBase > 0;
  }

  validarCodigo() {
    return this.Codigo && this.Codigo.length > 0;
  }

  toJSON() {
    return {
      id: this.Id,
      codigo: this.Codigo,
      nombre: this.Nombre,
      apellido: this.Apellido,
      nombreCompleto: this.NombreCompleto,
      posicion: this.Posicion,
      departamento: this.Departamento,
      salarioBase: this.SalarioBase,
      salarioDiario: this.SalarioDiario,
      salarioPorHora: this.SalarioPorHora,
      fechaIngreso: this.FechaIngreso,
      tipoJornada: this.TipoJornada,
      activo: this.Activo === 1
    };
  }
}

export default Empleado;