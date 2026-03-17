// src/services/RegistroManualService.js
import RegistroAsistenciaRepository from '../repositories/RegistroAsistenciaRepository.js';
import EmpleadoRepository from '../repositories/EmpleadoRepository.js';
import logger from '../middleware/logger.js';
import { HTTP_STATUS, TIPOS_REGISTRO, ORIGENES_DATOS } from '../utils/constants.js';

class RegistroManualService {
  /**
   * Crear registro manual de asistencia
   */
  async crearRegistroManual(datos, usuario = 'SISTEMA') {
    try {
      const { empleadoId, fecha, horaEntrada, horaSalida, comentarios } = datos;

      // Validar que el empleado existe
      const empleado = await EmpleadoRepository.findById(empleadoId);
      if (!empleado) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Empleado no encontrado'
        };
      }

      // Validar que no exista registro para la misma fecha
      const existe = await RegistroAsistenciaRepository.existeRegistro(empleadoId, fecha);
      if (existe) {
        throw {
          status: HTTP_STATUS.CONFLICT,
          message: `Ya existe un registro para el empleado ${empleado.Codigo} en la fecha ${fecha}`
        };
      }

      // Validar horas si ambas están presentes
      if (horaEntrada && horaSalida) {
        this._validarHoras(horaEntrada, horaSalida);
      }

      const registro = await RegistroAsistenciaRepository.create({
        EmpleadoId: empleadoId,
        Fecha: fecha,
        HoraEntrada: horaEntrada || null,
        HoraSalida: horaSalida || null,
        TipoRegistro: TIPOS_REGISTRO.MANUAL,
        Origen: ORIGENES_DATOS.MANUAL,
        Comentarios: comentarios,
        UsuarioCreacion: usuario
      });

      logger.info('Registro manual creado', {
        registroId: registro.Id,
        empleadoId,
        fecha
      });

      return registro;
    } catch (error) {
      logger.error('Error al crear registro manual', error);
      throw error;
    }
  }

  /**
   * Actualizar registro manual
   */
  async actualizarRegistroManual(id, datos, usuario = 'SISTEMA') {
    try {
      const registroExistente = await RegistroAsistenciaRepository.findById(id);

      if (!registroExistente) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Registro no encontrado'
        };
      }

      // Validar que sea un registro manual
      if (registroExistente.TipoRegistro !== TIPOS_REGISTRO.MANUAL) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Solo se pueden actualizar registros manuales'
        };
      }

      // Validar horas si ambas están presentes
      if (datos.horaEntrada && datos.horaSalida) {
        this._validarHoras(datos.horaEntrada, datos.horaSalida);
      }

      // Si ya fue procesado, no permitir cambios
      if (registroExistente.Procesado) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'No se puede modificar un registro ya procesado'
        };
      }

      const registroActualizado = await RegistroAsistenciaRepository.update(id, {
        HoraEntrada: datos.horaEntrada,
        HoraSalida: datos.horaSalida,
        Comentarios: datos.comentarios,
        UsuarioActualizacion: usuario
      });

      logger.info('Registro manual actualizado', { registroId: id });

      return registroActualizado;
    } catch (error) {
      logger.error('Error al actualizar registro manual', error);
      throw error;
    }
  }

  /**
   * Eliminar registro manual
   */
  async eliminarRegistroManual(id) {
    try {
      const registro = await RegistroAsistenciaRepository.findById(id);

      if (!registro) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Registro no encontrado'
        };
      }

      // Validar que sea un registro manual
      if (registro.TipoRegistro !== TIPOS_REGISTRO.MANUAL) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Solo se pueden eliminar registros manuales'
        };
      }

      // Si ya fue procesado, no permitir eliminación
      if (registro.Procesado) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'No se puede eliminar un registro ya procesado'
        };
      }

      const resultado = await RegistroAsistenciaRepository.delete(id, false);

      logger.info('Registro manual eliminado', { registroId: id });

      return resultado;
    } catch (error) {
      logger.error('Error al eliminar registro manual', error);
      throw error;
    }
  }

  /**
   * Obtener registros manuales por empleado
   */
  async obtenerRegistrosPorEmpleado(empleadoId, fechaInicio = null, fechaFin = null) {
    try {
      const empleado = await EmpleadoRepository.findById(empleadoId);
      if (!empleado) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Empleado no encontrado'
        };
      }

      const registros = await RegistroAsistenciaRepository.findByEmpleado(
        empleadoId,
        fechaInicio,
        fechaFin
      );

      // Filtrar solo manuales
      const manuales = registros.filter(r => r.TipoRegistro === TIPOS_REGISTRO.MANUAL);

      return manuales;
    } catch (error) {
      logger.error('Error al obtener registros manuales', error);
      throw error;
    }
  }

  /**
   * Crear registro de entrada (marcación)
   */
  async marcarEntrada(empleadoId, fecha, horaEntrada, usuario = 'SISTEMA') {
    try {
      // Verificar si ya tiene entrada hoy
      const registrosHoy = await RegistroAsistenciaRepository.findByEmpleado(empleadoId, fecha, fecha);
      
      const entradaHoy = registrosHoy.find(r => r.HoraEntrada && !r.HoraSalida);
      
      if (entradaHoy) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Ya existe una entrada sin salida para hoy'
        };
      }

      return await this.crearRegistroManual({
        empleadoId,
        fecha,
        horaEntrada,
        horaSalida: null,
        comentarios: 'Marcación de entrada'
      }, usuario);
    } catch (error) {
      logger.error('Error al marcar entrada', error);
      throw error;
    }
  }

  /**
   * Crear registro de salida (marcación)
   */
  async marcarSalida(empleadoId, fecha, horaSalida, usuario = 'SISTEMA') {
    try {
      // Buscar registro de entrada sin salida
      const registrosHoy = await RegistroAsistenciaRepository.findByEmpleado(empleadoId, fecha, fecha);
      
      const entradaSinSalida = registrosHoy.find(r => r.HoraEntrada && !r.HoraSalida);
      
      if (!entradaSinSalida) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'No hay una entrada sin salida para hoy'
        };
      }

      // Actualizar con salida
      return await this.actualizarRegistroManual(entradaSinSalida.Id, {
        horaSalida,
        comentarios: 'Marcación de salida'
      }, usuario);
    } catch (error) {
      logger.error('Error al marcar salida', error);
      throw error;
    }
  }

  /**
   * Validar horas
   */
  _validarHoras(entrada, salida) {
    const [hEnt, mEnt] = entrada.split(':').map(Number);
    const [hSal, mSal] = salida.split(':').map(Number);
    
    const minutosEntrada = hEnt * 60 + mEnt;
    const minutosSalida = hSal * 60 + mSal;
    
    // Permitir cruce de medianoche (salida al día siguiente)
    if (minutosSalida < minutosEntrada) {
      // Es válido, cruza medianoche
      return;
    }
    
    if (minutosSalida <= minutosEntrada) {
      throw {
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'La hora de salida debe ser posterior a la hora de entrada'
      };
    }

    const horasTrabajadas = (minutosSalida - minutosEntrada) / 60;
    
    if (horasTrabajadas > 24) {
      throw {
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'Las horas trabajadas no pueden exceder 24 horas'
      };
    }
  }
}

export default new RegistroManualService();