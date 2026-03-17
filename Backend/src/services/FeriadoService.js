// src/services/FeriadoService.js
import FeriadoRepository from '../repositories/FeriadoRepository.js';
import logger from '../middleware/logger.js';
import { HTTP_STATUS, FERIADOS_RD } from '../utils/constants.js';
import moment from 'moment';

class FeriadoService {
  /**
   * Listar todos los feriados
   */
  async listarFeriados(activo = true) {
    try {
      const feriados = await FeriadoRepository.findAll(
        activo ? 'Activo = 1' : '1=1', 
        {}, 
        1, 
        100, 
        'Mes, Dia'
      );
      
      return feriados.data;
    } catch (error) {
      logger.error('Error al listar feriados', error);
      throw error;
    }
  }

  /**
   * Obtener feriado por ID
   */
  async obtenerFeriadoPorId(id) {
    try {
      const feriado = await FeriadoRepository.findById(id);
      
      if (!feriado) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Feriado no encontrado'
        };
      }
      
      return feriado;
    } catch (error) {
      logger.error('Error al obtener feriado', error);
      throw error;
    }
  }

  /**
   * Crear nuevo feriado
   */
  async crearFeriado(datos) {
    try {
      const feriado = await FeriadoRepository.create(datos);
      
      logger.info('Feriado creado', { 
        id: feriado.Id, 
        nombre: feriado.Nombre 
      });
      
      return feriado;
    } catch (error) {
      logger.error('Error al crear feriado', error);
      throw error;
    }
  }

  /**
   * Actualizar feriado
   */
  async actualizarFeriado(id, datos) {
    try {
      const feriadoExistente = await FeriadoRepository.findById(id);
      
      if (!feriadoExistente) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Feriado no encontrado'
        };
      }

      const feriadoActualizado = await FeriadoRepository.update(id, datos);

      logger.info('Feriado actualizado', { id, nombre: feriadoActualizado.Nombre });

      return feriadoActualizado;
    } catch (error) {
      logger.error('Error al actualizar feriado', error);
      throw error;
    }
  }

  /**
   * Eliminar feriado
   */
  async eliminarFeriado(id) {
    try {
      const feriado = await FeriadoRepository.findById(id);
      
      if (!feriado) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Feriado no encontrado'
        };
      }

      const resultado = await FeriadoRepository.delete(id, false);
      
      logger.info('Feriado eliminado', { id, nombre: feriado.Nombre });
      
      return resultado;
    } catch (error) {
      logger.error('Error al eliminar feriado', error);
      throw error;
    }
  }

  /**
   * Verificar si una fecha es feriado
   */
  async esFeriado(fecha) {
    try {
      const feriado = await FeriadoRepository.esFeriado(fecha);
      return {
        esFeriado: !!feriado,
        feriado: feriado ? feriado.toJSON() : null
      };
    } catch (error) {
      logger.error('Error al verificar feriado', error);
      throw error;
    }
  }

  /**
   * Obtener feriados por año
   */
  async obtenerFeriadosPorAnio(anio) {
    try {
      const feriados = await FeriadoRepository.findByAnio(anio);
      
      // Formatear para calendario
      const calendario = feriados.map(f => ({
        fecha: moment(`${anio}-${f.Mes}-${f.Dia}`).format('YYYY-MM-DD'),
        nombre: f.Nombre,
        tipo: f.EsFijo ? 'Fijo' : 'Móvil',
        aplicaPorcentaje100: f.AplicaPorcentaje100
      }));

      return calendario;
    } catch (error) {
      logger.error('Error al obtener feriados por año', error);
      throw error;
    }
  }

  /**
   * Obtener próximos feriados
   */
  async obtenerProximosFeriados(limite = 5) {
    try {
      const proximos = await FeriadoRepository.getProximosFeriados(limite);
      
      return proximos.map(f => ({
        ...f,
        fechaProximo: moment(f.FechaProximo).format('YYYY-MM-DD'),
        diasRestantes: moment(f.FechaProximo).diff(moment(), 'days')
      }));
    } catch (error) {
      logger.error('Error al obtener próximos feriados', error);
      throw error;
    }
  }

  /**
   * Inicializar feriados por defecto (para año nuevo)
   */
  async inicializarFeriadosPorDefecto(anio) {
    try {
      // Verificar si ya existen
      const existentes = await FeriadoRepository.findByAnio(anio);
      
      if (existentes.length > 0) {
        logger.info('Feriados ya existen para el año', { anio, cantidad: existentes.length });
        return existentes;
      }

      const creados = [];
      
      for (const feriadoDef of FERIADOS_RD) {
        if (feriadoDef.fijo) {
          // Verificar si ya existe como fijo
          const existe = await FeriadoRepository.findOneByField('Nombre', feriadoDef.nombre);
          if (!existe) {
            const nuevo = await FeriadoRepository.create({
              Nombre: feriadoDef.nombre,
              Dia: feriadoDef.dia,
              Mes: feriadoDef.mes,
              EsFijo: 1,
              AplicaPorcentaje100: 1
            });
            creados.push(nuevo);
          }
        } else {
          // Calcular fecha móvil para el año (simplificado)
          // Nota: Esto debería ser más complejo según el tipo de feriado móvil
          const fechaMovil = this._calcularFeriadoMovil(feriadoDef, anio);
          if (fechaMovil) {
            const nuevo = await FeriadoRepository.crearFeriadoMovil(
              feriadoDef.nombre,
              fechaMovil.dia,
              fechaMovil.mes,
              anio
            );
            creados.push(nuevo);
          }
        }
      }

      logger.info('Feriados inicializados', { anio, cantidad: creados.length });
      return creados;
    } catch (error) {
      logger.error('Error al inicializar feriados', error);
      throw error;
    }
  }

  /**
   * Calcular feriado móvil (simplificado - deberías implementar según cada caso)
   */
  _calcularFeriadoMovil(feriadoDef, anio) {
    // Implementación simplificada - en producción deberías calcular según cada tipo
    // Por ejemplo: Día del Trabajo (primer lunes de mayo)
    if (feriadoDef.nombre === 'Día del Trabajo') {
      const fecha = moment(`${anio}-05-01`);
      // Buscar primer lunes
      while (fecha.day() !== 1) {
        fecha.add(1, 'day');
      }
      return {
        dia: fecha.date(),
        mes: 5
      };
    }
    
    // Corpus Christi (60 días después del domingo de resurrección - complejo)
    // Por simplicidad, usamos una fecha aproximada
    if (feriadoDef.nombre === 'Corpus Christi') {
      return { dia: 30, mes: 5 };
    }
    
    return null;
  }
}

export default new FeriadoService();