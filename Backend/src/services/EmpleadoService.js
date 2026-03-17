// src/services/EmpleadoService.js
import EmpleadoRepository from '../repositories/EmpleadoRepository.js';
import logger from '../middleware/logger.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants.js';

class EmpleadoService {
  /**
   * Listar empleados con filtros
   */
  async listarEmpleados(filtros = {}) {
    const { activo = true, pagina = 1, limite = 20, departamento, tipoJornada } = filtros;
    
    try {
      let resultado;
      
      if (departamento) {
        const empleados = await EmpleadoRepository.findByDepartamento(departamento);
        resultado = {
          data: empleados,
          total: empleados.length,
          pagina: 1,
          limite: empleados.length,
          totalPaginas: 1
        };
      } else if (tipoJornada) {
        const empleados = await EmpleadoRepository.findByTipoJornada(tipoJornada);
        resultado = {
          data: empleados,
          total: empleados.length,
          pagina: 1,
          limite: empleados.length,
          totalPaginas: 1
        };
      } else {
        resultado = activo 
          ? await EmpleadoRepository.findActivos(pagina, limite)
          : await EmpleadoRepository.findInactivos(pagina, limite);
      }
      
      logger.debug('Empleados listados', { total: resultado.total });
      return resultado;
    } catch (error) {
      logger.error('Error al listar empleados', error);
      throw error;
    }
  }

  /**
   * Obtener empleado por ID
   */
  async obtenerEmpleadoPorId(id) {
    try {
      const empleado = await EmpleadoRepository.findById(id);
      
      if (!empleado) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: ERROR_MESSAGES.EMPLEADO_NO_ENCONTRADO
        };
      }
      
      return empleado;
    } catch (error) {
      logger.error('Error al obtener empleado', error);
      throw error;
    }
  }

  /**
   * Obtener empleado por código
   */
  async obtenerEmpleadoPorCodigo(codigo) {
    try {
      const empleado = await EmpleadoRepository.findByCodigo(codigo);
      
      if (!empleado) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: ERROR_MESSAGES.EMPLEADO_NO_ENCONTRADO
        };
      }
      
      return empleado;
    } catch (error) {
      logger.error('Error al obtener empleado por código', error);
      throw error;
    }
  }

  /**
   * Crear nuevo empleado
   */
  async crearEmpleado(datos, usuario = 'SISTEMA') {
    try {
      // Validar código único
      const existe = await EmpleadoRepository.existeCodigo(datos.codigo);
      if (existe) {
        throw {
          status: HTTP_STATUS.CONFLICT,
          message: ERROR_MESSAGES.EMPLEADO_CODIGO_DUPLICADO
        };
      }

      // Calcular salarios derivados
      const empleadoData = {
        ...datos,
        UsuarioCreacion: usuario
      };

      const empleado = await EmpleadoRepository.create(empleadoData);
      
      logger.info('Empleado creado', { 
        id: empleado.Id, 
        codigo: empleado.Codigo,
        nombre: empleado.NombreCompleto 
      });
      
      return empleado;
    } catch (error) {
      logger.error('Error al crear empleado', error);
      throw error;
    }
  }

  /**
   * Actualizar empleado
   */
  async actualizarEmpleado(id, datos, usuario = 'SISTEMA') {
    try {
      const empleadoExistente = await EmpleadoRepository.findById(id);
      
      if (!empleadoExistente) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: ERROR_MESSAGES.EMPLEADO_NO_ENCONTRADO
        };
      }

      // Si cambia el código, verificar que no exista
      if (datos.codigo && datos.codigo !== empleadoExistente.Codigo) {
        const existe = await EmpleadoRepository.existeCodigo(datos.codigo, id);
        if (existe) {
          throw {
            status: HTTP_STATUS.CONFLICT,
            message: ERROR_MESSAGES.EMPLEADO_CODIGO_DUPLICADO
          };
        }
      }

      const empleadoActualizado = await EmpleadoRepository.update(id, {
        ...datos,
        UsuarioActualizacion: usuario
      });

      logger.info('Empleado actualizado', { 
        id: empleadoActualizado.Id, 
        codigo: empleadoActualizado.Codigo 
      });

      return empleadoActualizado;
    } catch (error) {
      logger.error('Error al actualizar empleado', error);
      throw error;
    }
  }

  /**
   * Eliminar empleado (soft delete)
   */
  async eliminarEmpleado(id, usuario = 'SISTEMA') {
    try {
      const empleado = await EmpleadoRepository.findById(id);
      
      if (!empleado) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: ERROR_MESSAGES.EMPLEADO_NO_ENCONTRADO
        };
      }

      const resultado = await EmpleadoRepository.delete(id, true);
      
      logger.info('Empleado eliminado', { id, codigo: empleado.Codigo });
      
      return resultado;
    } catch (error) {
      logger.error('Error al eliminar empleado', error);
      throw error;
    }
  }

  /**
   * Buscar empleados
   */
  async buscarEmpleados(termino, pagina = 1, limite = 20) {
    try {
      if (!termino || termino.length < 2) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'El término de búsqueda debe tener al menos 2 caracteres'
        };
      }

      const resultados = await EmpleadoRepository.search(termino, pagina, limite);
      
      logger.debug('Búsqueda de empleados', { termino, total: resultados.total });
      
      return resultados;
    } catch (error) {
      logger.error('Error al buscar empleados', error);
      throw error;
    }
  }
  /**
 * Obtener TODOS los empleados activos (sin paginación)
 * Para usar en mapas, selectores y caché del frontend
 */
async obtenerTodosActivos() {
  try {
    const empleados = await EmpleadoRepository.findAllActivos();
    
    logger.debug('Todos los empleados activos obtenidos', { total: empleados.length });
    
    return empleados.map(e => e.toJSON());
  } catch (error) {
    logger.error('Error al obtener todos los empleados', error);
    throw error;
  }
}

  /**
   * Obtener estadísticas de empleados
   */
  async obtenerEstadisticas() {
    try {
      const estadisticas = await EmpleadoRepository.getEstadisticas();
      return estadisticas;
    } catch (error) {
      logger.error('Error al obtener estadísticas', error);
      throw error;
    }
  }

  /**
   * Actualizar salario masivo
   */
  async actualizarSalariosMasivo(empleadosIds, nuevoSalario, usuario = 'SISTEMA') {
    try {
      if (!empleadosIds || !empleadosIds.length) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Debe proporcionar al menos un empleado'
        };
      }

      if (nuevoSalario <= 0) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'El salario debe ser mayor a 0'
        };
      }

      const resultados = await EmpleadoRepository.actualizarSalarios(
        empleadosIds, 
        nuevoSalario, 
        usuario
      );

      logger.info('Salarios actualizados masivamente', { 
        cantidad: resultados.length,
        nuevoSalario 
      });

      return resultados;
    } catch (error) {
      logger.error('Error al actualizar salarios masivo', error);
      throw error;
    }
  }

  /**
   * Exportar empleados a formato para reporte
   */
  async exportarEmpleados(formato = 'csv') {
    try {
      const empleados = await EmpleadoRepository.findActivos(1, 1000);
      
      const datosExportar = empleados.data.map(e => ({
        codigo: e.Codigo,
        nombre: e.Nombre,
        apellido: e.Apellido,
        nombreCompleto: e.NombreCompleto,
        posicion: e.Posicion,
        departamento: e.Departamento,
        salarioBase: e.SalarioBase,
        salarioDiario: e.SalarioDiario,
        salarioPorHora: e.SalarioPorHora,
        fechaIngreso: e.FechaIngreso,
        tipoJornada: e.TipoJornada
      }));

      return datosExportar;
    } catch (error) {
      logger.error('Error al exportar empleados', error);
      throw error;
    }
  }
}

export default new EmpleadoService();