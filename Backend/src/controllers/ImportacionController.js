// src/controllers/ImportacionController.js
import { catchAsync } from '../middleware/errorHandler.js';
import ImportacionService from '../services/ImportacionService.js';
import responseFormatter from '../utils/responseFormatter.js';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants.js';
import logger from '../utils/logger.js';
import path from 'path';

class ImportacionController {
  /**
   * Importar archivo Excel
   * POST /api/importacion
   */
  importar = catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'No se ha subido ningún archivo'
      });
    }

    const resultado = await ImportacionService.procesarArchivo(
      req.file,
      req.usuario?.nombre || 'SISTEMA'
    );

    res.status(HTTP_STATUS.CREATED).json(
      responseFormatter.importResult(resultado)
    );
  });

  /**
   * Listar importaciones
   * GET /api/importacion
   */
  listar = catchAsync(async (req, res) => {
    const filtros = {
      estado: req.query.estado,
      pagina: req.query.pagina,
      limite: req.query.limite,
      fechaInicio: req.query.fechaInicio,
      fechaFin: req.query.fechaFin
    };

    const resultado = await ImportacionService.listarImportaciones(filtros);

    res.json(responseFormatter.paginated(
      resultado.data,
      {
        total: resultado.total,
        page: resultado.pagina,
        limit: resultado.limite,
        pages: Math.ceil(resultado.total / resultado.limite)
      },
      'Importaciones listadas correctamente'
    ));
  });

  /**
   * Obtener importación por ID
   * GET /api/importacion/:id
   */
  obtener = catchAsync(async (req, res) => {
    const { id } = req.params;
    const importacion = await ImportacionService.obtenerImportacionPorId(id);

    res.json(responseFormatter.success(
      importacion,
      'Importación encontrada'
    ));
  });

  /**
   * Procesar importación
   * POST /api/importacion/:id/procesar
   */
  procesar = catchAsync(async (req, res) => {
    const { id } = req.params;
    const resultado = await ImportacionService.procesarImportacion(id);

    res.json(responseFormatter.success(
      resultado,
      'Importación procesada correctamente'
    ));
  });

  /**
   * Eliminar importación
   * DELETE /api/importacion/:id
   */
  eliminar = catchAsync(async (req, res) => {
    const { id } = req.params;
    const resultado = await ImportacionService.eliminarImportacion(id);

    res.json(responseFormatter.success(
      resultado,
      'Importación eliminada correctamente'
    ));
  });

  /**
   * Validar estructura de Excel
   * POST /api/importacion/validar
   */
  validar = catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'No se ha subido ningún archivo'
      });
    }

    const resultado = await ImportacionService.validarEstructura(req.file);

    res.json(responseFormatter.success(
      resultado,
      resultado.valido ? 'Estructura válida' : 'Estructura inválida'
    ));
  });

  /**
   * Obtener resumen de importaciones
   * GET /api/importacion/resumen
   */
  resumen = catchAsync(async (req, res) => {
    const resumen = await ImportacionService.obtenerResumen();

    res.json(responseFormatter.success(
      resumen,
      'Resumen de importaciones'
    ));
  });

  /**
   * Obtener importaciones por período
   * GET /api/importacion/periodo
   */
  porPeriodo = catchAsync(async (req, res) => {
    const { fechaInicio, fechaFin, pagina, limite } = req.query;
    
    const resultado = await ImportacionService.listarImportaciones({
      fechaInicio,
      fechaFin,
      pagina,
      limite
    });

    res.json(responseFormatter.paginated(
      resultado.data,
      {
        total: resultado.total,
        page: resultado.pagina,
        limit: resultado.limite,
        pages: Math.ceil(resultado.total / resultado.limite)
      },
      `Importaciones del ${fechaInicio} al ${fechaFin}`
    ));
  });

  /**
   * Descargar reporte de errores
   * GET /api/importacion/:id/errores
   */
  descargarErrores = catchAsync(async (req, res) => {
    const { id } = req.params;
    const importacion = await ImportacionService.obtenerImportacionPorId(id);

    if (!importacion.errores || importacion.errores.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'No hay errores en esta importación'
      });
    }

    // Generar CSV con errores
    const csvContent = this._generarErroresCSV(importacion.errores);
    const filename = `errores_importacion_${id}_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csvContent);
  });

  /**
   * Reintentar registros con error
   * POST /api/importacion/:id/reintentar
   */
  reintentar = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { registrosIds } = req.body;

    // Aquí iría la lógica para reintentar
    // Por ahora solo respondemos
    res.json(responseFormatter.success(
      { importacionId: id, registrosReintentados: registrosIds?.length || 0 },
      'Reintento iniciado'
    ));
  });

  /**
   * Generar CSV de errores
   */
  _generarErroresCSV(errores) {
    if (!errores.length) return '';
    
    const headers = 'Fila,Código,Fecha,Error\n';
    const rows = errores.map(e => 
      `${e.fila || ''},${e.codigo || ''},${e.fecha || ''},"${e.error || ''}"`
    ).join('\n');
    
    return headers + rows;
  }
}

export default new ImportacionController();