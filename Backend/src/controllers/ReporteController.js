// src/controllers/ReporteController.js
import { catchAsync } from '../middleware/errorHandler.js';
import ReporteService from '../services/ReporteService.js';
import responseFormatter from '../utils/responseFormatter.js';
import { HTTP_STATUS } from '../utils/constants.js';
import fs from 'fs';

class ReporteController {
  /**
   * Generar reporte quincenal
   * GET /api/reportes/quincenal/:anio/:mes/:quincena
   */
  quincenal = catchAsync(async (req, res) => {
    const { anio, mes, quincena } = req.params;
    const { formato = 'json' } = req.query;

    const reporte = await ReporteService.generarReporteQuincenal(
      parseInt(anio),
      parseInt(mes),
      parseInt(quincena),
      formato
    );

    if (formato === 'json') {
      res.json(responseFormatter.success(
        reporte,
        'Reporte quincenal generado'
      ));
    } else if (formato === 'csv' || formato === 'excel') {
      const filename = `reporte_quincenal_${anio}_${mes}_${quincena}.${formato === 'csv' ? 'csv' : 'xlsx'}`;
      
      res.setHeader('Content-Type', 
        formato === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      if (reporte.content) {
        res.send(reporte.content);
      } else {
        res.send(JSON.stringify(reporte.datos, null, 2));
      }
    }
  });

  /**
   * Generar reporte mensual
   * GET /api/reportes/mensual/:anio/:mes
   */
  mensual = catchAsync(async (req, res) => {
    const { anio, mes } = req.params;
    const { formato = 'json' } = req.query;

    const reporte = await ReporteService.generarReporteMensual(
      parseInt(anio),
      parseInt(mes),
      formato
    );

    if (formato === 'json') {
      res.json(responseFormatter.success(
        reporte,
        'Reporte mensual generado'
      ));
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_mensual_${anio}_${mes}.csv`);
      res.send(reporte.content || '');
    }
  });

  /**
   * Generar reporte anual
   * GET /api/reportes/anual/:anio
   */
  anual = catchAsync(async (req, res) => {
    const { anio } = req.params;
    const { formato = 'json' } = req.query;

    const reporte = await ReporteService.generarReporteAnual(
      parseInt(anio),
      formato
    );

    if (formato === 'json') {
      res.json(responseFormatter.success(
        reporte,
        'Reporte anual generado'
      ));
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_anual_${anio}.csv`);
      res.send(reporte.content || '');
    }
  });

  /**
   * Generar reporte por empleado
   * GET /api/reportes/empleado/:empleadoId
   */
  empleado = catchAsync(async (req, res) => {
    const { empleadoId } = req.params;
    const { fechaInicio, fechaFin, formato = 'json' } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Debe proporcionar fecha inicio y fecha fin'
      });
    }

    const reporte = await ReporteService.generarReporteEmpleado(
      parseInt(empleadoId),
      fechaInicio,
      fechaFin,
      formato
    );

    if (formato === 'json') {
      res.json(responseFormatter.success(
        reporte,
        'Reporte de empleado generado'
      ));
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_empleado_${empleadoId}.csv`);
      res.send(reporte.content || '');
    }
  });

  /**
   * Generar reporte de importaciones
   * GET /api/reportes/importaciones
   */
  importaciones = catchAsync(async (req, res) => {
    const { fechaInicio, fechaFin, formato = 'json' } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Debe proporcionar fecha inicio y fecha fin'
      });
    }

    const reporte = await ReporteService.generarReporteImportaciones(
      fechaInicio,
      fechaFin,
      formato
    );

    if (formato === 'json') {
      res.json(responseFormatter.success(
        reporte,
        'Reporte de importaciones generado'
      ));
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_importaciones.csv`);
      res.send(reporte.content || '');
    }
  });

  /**
   * Generar reporte comparativo
   * GET /api/reportes/comparativo
   */
  comparativo = catchAsync(async (req, res) => {
    const { anio1, mes1, quincena1, anio2, mes2, quincena2 } = req.query;

    if (!anio1 || !mes1 || !quincena1 || !anio2 || !mes2 || !quincena2) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Debe proporcionar los dos períodos a comparar'
      });
    }

    const reporte1 = await ReporteService.generarReporteQuincenal(
      parseInt(anio1),
      parseInt(mes1),
      parseInt(quincena1),
      'json'
    );

    const reporte2 = await ReporteService.generarReporteQuincenal(
      parseInt(anio2),
      parseInt(mes2),
      parseInt(quincena2),
      'json'
    );

    const comparativo = {
      periodo1: {
        anio: parseInt(anio1),
        mes: parseInt(mes1),
        quincena: parseInt(quincena1),
        totalPagar: reporte1.resumen?.totalPagar || 0,
        totalHoras: reporte1.resumen?.totalHoras || 0
      },
      periodo2: {
        anio: parseInt(anio2),
        mes: parseInt(mes2),
        quincena: parseInt(quincena2),
        totalPagar: reporte2.resumen?.totalPagar || 0,
        totalHoras: reporte2.resumen?.totalHoras || 0
      },
      variacion: {
        totalPagar: (reporte2.resumen?.totalPagar || 0) - (reporte1.resumen?.totalPagar || 0),
        totalHoras: (reporte2.resumen?.totalHoras || 0) - (reporte1.resumen?.totalHoras || 0),
        porcentaje: reporte1.resumen?.totalPagar ? 
          (((reporte2.resumen?.totalPagar || 0) - (reporte1.resumen?.totalPagar || 0)) / reporte1.resumen.totalPagar) * 100 : 0
      }
    };

    res.json(responseFormatter.success(
      comparativo,
      'Reporte comparativo generado'
    ));
  });

  /**
   * Descargar reporte
   * GET /api/reportes/download/:filename
   */
  descargar = catchAsync(async (req, res) => {
    const { filename } = req.params;
    const filePath = `./uploads/temp/${filename}`;

    if (!fs.existsSync(filePath)) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Archivo no encontrado'
      });
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error al descargar archivo:', err);
      }
      // Eliminar archivo después de descargar (opcional)
      fs.unlink(filePath, () => {});
    });
  });

  /**
   * Programar reporte automático
   * POST /api/reportes/programar
   */
  programar = catchAsync(async (req, res) => {
    const { tipo, frecuencia, email } = req.body;

    // Aquí iría la lógica para programar envío de reportes
    // Por ahora solo respondemos

    res.json(responseFormatter.success(
      { tipo, frecuencia, email, programado: true },
      'Reporte programado correctamente'
    ));
  });
}

export default new ReporteController();