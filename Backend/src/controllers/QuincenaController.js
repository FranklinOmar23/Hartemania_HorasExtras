// src/controllers/QuincenaController.js
import { catchAsync } from '../middleware/errorHandler.js';
import QuincenaService from '../services/QuincenaService.js';
import responseFormatter from '../utils/responseFormatter.js';
import { HTTP_STATUS } from '../utils/constants.js';

class QuincenaController {
  /**
   * Calcular quincena
   * POST /api/quincenas/calcular/:anio/:mes/:quincena
   */
  calcular = catchAsync(async (req, res) => {
    const { anio, mes, quincena } = req.params;
    
    const resultado = await QuincenaService.calcularQuincena(
      parseInt(anio),
      parseInt(mes),
      parseInt(quincena),
      req.usuario?.nombre || 'SISTEMA'
    );

    res.json(responseFormatter.success(
      resultado,
      `Quincena calculada correctamente`
    ));
  });

  /**
   * Obtener resumen de quincena
   * GET /api/quincenas/:anio/:mes/:quincena
   */
  obtenerResumen = catchAsync(async (req, res) => {
    const { anio, mes, quincena } = req.params;
    const { incluirDetalle } = req.query;

    const resultado = await QuincenaService.obtenerResumenQuincena(
      parseInt(anio),
      parseInt(mes),
      parseInt(quincena)
    );

    if (incluirDetalle === 'false') {
      // Solo devolver totales
      return res.json(responseFormatter.success(
        {
          periodo: resultado.periodo,
          totales: resultado.totales
        },
        'Resumen de quincena'
      ));
    }

    res.json(responseFormatter.success(
      resultado,
      'Resumen de quincena'
    ));
  });

  /**
   * Obtener resumen mensual
   * GET /api/quincenas/mensual/:anio/:mes
   */
  obtenerMensual = catchAsync(async (req, res) => {
    const { anio, mes } = req.params;

    const resultado = await QuincenaService.obtenerResumenMensual(
      parseInt(anio),
      parseInt(mes)
    );

    res.json(responseFormatter.success(
      resultado,
      `Resumen mensual de ${resultado.nombre}`
    ));
  });

  /**
   * Obtener histórico de empleado
   * GET /api/quincenas/empleado/:empleadoId
   */
  historicoEmpleado = catchAsync(async (req, res) => {
    const { empleadoId } = req.params;
    const { limite } = req.query;

    const resultado = await QuincenaService.obtenerHistoricoEmpleado(
      parseInt(empleadoId),
      limite ? parseInt(limite) : 12
    );

    res.json(responseFormatter.success(
      resultado,
      'Histórico de quincenas del empleado'
    ));
  });

  /**
   * Obtener ranking de empleados
   * GET /api/quincenas/ranking/:anio/:mes/:quincena
   */
  ranking = catchAsync(async (req, res) => {
    const { anio, mes, quincena } = req.params;
    const { limite } = req.query;

    const resultado = await QuincenaService.obtenerRanking(
      parseInt(anio),
      parseInt(mes),
      parseInt(quincena),
      limite ? parseInt(limite) : 10
    );

    res.json(responseFormatter.success(
      resultado,
      'Ranking de empleados'
    ));
  });

  /**
   * Recalcular quincena
   * POST /api/quincenas/recalcular/:anio/:mes/:quincena
   */
  recalcular = catchAsync(async (req, res) => {
    const { anio, mes, quincena } = req.params;

    const resultado = await QuincenaService.recalcularQuincena(
      parseInt(anio),
      parseInt(mes),
      parseInt(quincena),
      req.usuario?.nombre || 'SISTEMA'
    );

    res.json(responseFormatter.success(
      resultado,
      'Quincena recalculada correctamente'
    ));
  });

  /**
   * Obtener totales por período
   * GET /api/quincenas/totales/:anio/:mes/:quincena
   */
  totales = catchAsync(async (req, res) => {
    const { anio, mes, quincena } = req.params;

    const totales = await QuincenaService.obtenerResumenQuincena(
      parseInt(anio),
      parseInt(mes),
      parseInt(quincena)
    );

    res.json(responseFormatter.success(
      totales.totales || {},
      'Totales de quincena'
    ));
  });

  /**
   * Exportar quincena
   * GET /api/quincenas/exportar/:anio/:mes/:quincena
   */
  exportar = catchAsync(async (req, res) => {
    const { anio, mes, quincena } = req.params;
    const { formato = 'json' } = req.query;

    const resultado = await QuincenaService.obtenerResumenQuincena(
      parseInt(anio),
      parseInt(mes),
      parseInt(quincena)
    );

    if (formato === 'json') {
      res.json(responseFormatter.success(
        resultado,
        'Exportación de quincena'
      ));
    } else if (formato === 'csv') {
      const csvContent = this._generarCSVQuincena(resultado);
      const filename = `quincena_${anio}_${mes}_${quincena}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(csvContent);
    } else {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Formato no soportado'
      });
    }
  });

  /**
   * Comparar quincenas
   * GET /api/quincenas/comparar
   */
  comparar = catchAsync(async (req, res) => {
    const { anio1, mes1, quincena1, anio2, mes2, quincena2 } = req.query;

    const q1 = await QuincenaService.obtenerResumenQuincena(
      parseInt(anio1),
      parseInt(mes1),
      parseInt(quincena1)
    );

    const q2 = await QuincenaService.obtenerResumenQuincena(
      parseInt(anio2),
      parseInt(mes2),
      parseInt(quincena2)
    );

    const comparacion = {
      quincena1: {
        periodo: q1.periodo,
        totales: q1.totales
      },
      quincena2: {
        periodo: q2.periodo,
        totales: q2.totales
      },
      diferencias: {
        totalPagar: (q2.totales?.totalPagar || 0) - (q1.totales?.totalPagar || 0),
        totalHoras: (q2.totales?.totalHoras || 0) - (q1.totales?.totalHoras || 0),
        porcentajeCambio: q1.totales?.totalPagar ? 
          (((q2.totales?.totalPagar || 0) - (q1.totales?.totalPagar || 0)) / q1.totales.totalPagar) * 100 : 0
      }
    };

    res.json(responseFormatter.success(
      comparacion,
      'Comparación de quincenas'
    ));
  });

  /**
   * Generar CSV de quincena
   */
  _generarCSVQuincena(data) {
    if (!data.resumen || !data.resumen.length) return '';
    
    const headers = 'Código,Empleado,HE 35%,HE 100%,HE 15%,HE Feriado,Total Horas,Monto 35%,Monto 100%,Monto 15%,Monto Feriado,Total Pagar\n';
    
    const rows = data.resumen.map(r => {
      const emp = r.empleado || {};
      return `${emp.codigo || ''},${emp.nombre || ''},${r.horas35 || 0},${r.horas100 || 0},${r.horas15 || 0},${r.horasFeriado || 0},${r.totalHoras || 0},${r.monto35 || 0},${r.monto100 || 0},${r.monto15 || 0},${r.montoFeriado || 0},${r.totalPagar || 0}`;
    }).join('\n');
    
    return headers + rows;
  }
}

export default new QuincenaController();