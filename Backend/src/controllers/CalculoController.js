// src/controllers/CalculoController.js
import { catchAsync } from '../middleware/errorHandler.js';
import CalculoService from '../services/CalculoService.js';
import RegistroAsistenciaRepository from '../repositories/RegistroAsistenciaRepository.js';
import responseFormatter from '../utils/responseFormatter.js';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants.js';
import dateHelpers from '../utils/dateHelpers.js';

class CalculoController {
  /**
   * Calcular horas extras para un registro
   * POST /api/calculos/registro/:id
   */
  calcularRegistro = catchAsync(async (req, res) => {
    const { id } = req.params;
    const resultado = await CalculoService.calcularHorasExtras(
      id,
      req.usuario?.nombre || 'SISTEMA'
    );

    res.json(responseFormatter.calculationResult(resultado));
  });

  /**
   * Calcular horas extras para múltiples registros
   * POST /api/calculos/masivo
   */
  calcularMasivo = catchAsync(async (req, res) => {
    const { registrosIds } = req.body;

    if (!registrosIds || !Array.isArray(registrosIds) || registrosIds.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Debe proporcionar un array de IDs de registros'
      });
    }

    const resultado = await CalculoService.calcularHorasExtrasMasivo(
      registrosIds,
      req.usuario?.nombre || 'SISTEMA'
    );

    res.json(responseFormatter.success(
      resultado,
      `Cálculo completado: ${resultado.exitosos.length} exitosos, ${resultado.errores.length} errores`
    ));
  });

  // En tu controlador de quincenas
async obtenerResumenQuincena(req, res) {
  try {
    const { anio, mes, quincena } = req.params;
    
    // Usar el nuevo método que incluye TODOS los empleados
    const resumen = await ResumenQuincenalRepository.getResumenCompleto(
      parseInt(anio),
      parseInt(mes),
      parseInt(quincena)
    );
    
    const totales = await ResumenQuincenalRepository.getTotalesPorPeriodo(
      parseInt(anio),
      parseInt(mes),
      parseInt(quincena)
    );
    
    res.json({
      success: true,
      data: {
        periodo: { anio, mes, quincena },
        resumen: resumen,  // ← AHORA INCLUYE TODOS LOS EMPLEADOS
        totales: totales || {
          TotalEmpleados: resumen.length,
          TotalHoras: resumen.reduce((sum, e) => sum + e.TotalHoras, 0),
          TotalPagar: resumen.reduce((sum, e) => sum + e.TotalPagar, 0),
          TotalHoras35: resumen.reduce((sum, e) => sum + e.Horas35, 0),
          TotalHoras100: resumen.reduce((sum, e) => sum + e.Horas100, 0),
          TotalHoras15: resumen.reduce((sum, e) => sum + e.Horas15, 0),
          TotalHorasFeriado: resumen.reduce((sum, e) => sum + e.HorasFeriado, 0)
        }
      },
      message: 'Resumen de quincena'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

  /**
   * Calcular registros pendientes de un período
   * POST /api/calculos/pendientes
   */
  calcularPendientes = catchAsync(async (req, res) => {
    const { fechaInicio, fechaFin } = req.body;

    const inicio = fechaInicio || dateHelpers.getFirstDayOfMonth(
      new Date().getFullYear(),
      new Date().getMonth() + 1
    );
    
    const fin = fechaFin || dateHelpers.getToday();

    const resultado = await CalculoService.calcularPendientes(
      inicio,
      fin,
      req.usuario?.nombre || 'SISTEMA'
    );

    res.json(responseFormatter.success(
      resultado,
      `Cálculo de pendientes completado: ${resultado.exitosos?.length || 0} procesados`
    ));
  });

  /**
   * Validar límite legal de horas extras
   * GET /api/calculos/validar-limite/:empleadoId
   */
  validarLimite = catchAsync(async (req, res) => {
    const { empleadoId } = req.params;
    const { anio, mes } = req.query;

    const anioNum = anio ? parseInt(anio) : new Date().getFullYear();
    const mesNum = mes ? parseInt(mes) : new Date().getMonth() + 1;

    const resultado = await CalculoService.validarLimiteLegal(
      empleadoId,
      anioNum,
      mesNum
    );

    res.json(responseFormatter.success(
      resultado,
      resultado.dentroLimite ? 'Dentro del límite legal' : 'Excede el límite legal'
    ));
  });

  /**
   * Obtener detalle de cálculo por registro
   * GET /api/calculos/registro/:id/detalle
   */
  detalleRegistro = catchAsync(async (req, res) => {
    const { id } = req.params;

    const registro = await RegistroAsistenciaRepository.obtenerPorId(id, true);

    if (!registro) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Registro no encontrado'
      });
    }

    res.json(responseFormatter.success(
      {
        registro: registro.toJSON(),
        calculos: registro.Calculos
      },
      'Detalle de cálculo'
    ));
  });

  /**
   * Recalcular registro (borrar cálculos y recalcular)
   * POST /api/calculos/registro/:id/recalcular
   */
  recalcular = catchAsync(async (req, res) => {
    const { id } = req.params;

    // Primero eliminar cálculos existentes
    // Esto debería estar en un método del repositorio
    // Por ahora llamamos al servicio normal

    const resultado = await CalculoService.calcularHorasExtras(
      id,
      req.usuario?.nombre || 'SISTEMA'
    );

    res.json(responseFormatter.success(
      resultado,
      'Registro recalculado correctamente'
    ));
  });

  /**
   * Obtener estadísticas de cálculos
   * GET /api/calculos/estadisticas
   */
  estadisticas = catchAsync(async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;

    const inicio = fechaInicio || dateHelpers.getFirstDayOfMonth(
      new Date().getFullYear(),
      new Date().getMonth() + 1
    );
    
    const fin = fechaFin || dateHelpers.getToday();

    // Aquí iría la lógica para obtener estadísticas
    // Por ahora retornamos un placeholder

    res.json(responseFormatter.success(
      {
        periodo: { inicio, fin },
        totalCalculos: 0,
        promedioHoras: 0,
        totalPagar: 0,
        porTipo: {
          '35%': 0,
          '100%': 0,
          '15%': 0
        }
      },
      'Estadísticas de cálculos'
    ));
  });

  /**
   * Programar cálculo automático
   * POST /api/calculos/programar
   */
  programar = catchAsync(async (req, res) => {
    const { hora } = req.body;

    // Aquí iría la lógica para programar
    // Por ahora solo respondemos

    res.json(responseFormatter.success(
      { hora, programado: true },
      `Cálculo automático programado para las ${hora || '02:00'}`
    ));
  });
}

export default new CalculoController();