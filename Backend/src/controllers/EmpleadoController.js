// src/controllers/EmpleadoController.js
import { catchAsync } from '../middleware/errorHandler.js';
import EmpleadoService from '../services/EmpleadoService.js';
import responseFormatter from '../utils/responseFormatter.js';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants.js';
import logger from '../utils/logger.js';

class EmpleadoController {
  /**
   * Listar empleados
   * GET /api/empleados
   */
  listar = catchAsync(async (req, res) => {
    const filtros = {
      activo: req.query.activo,
      pagina: req.query.pagina,
      limite: req.query.limite,
      departamento: req.query.departamento,
      tipoJornada: req.query.tipoJornada
    };

    const resultado = await EmpleadoService.listarEmpleados(filtros);

    res.json(responseFormatter.paginated(
      resultado.data,
      {
        total: resultado.total,
        page: resultado.pagina,
        limit: resultado.limite,
        pages: resultado.totalPaginas
      },
      'Empleados listados correctamente'
    ));
  });

  obtenerTodosActivos = catchAsync(async (req, res) => {
  const empleados = await EmpleadoService.obtenerTodosActivos();

  res.json(responseFormatter.success(
    empleados,
    'Todos los empleados obtenidos correctamente'
  ));
});

  /**
   * Obtener empleado por ID
   * GET /api/empleados/:id
   */
  obtener = catchAsync(async (req, res) => {
    const { id } = req.params;
    const empleado = await EmpleadoService.obtenerEmpleadoPorId(id);

    res.json(responseFormatter.success(
      empleado,
      'Empleado encontrado'
    ));
  });

  /**
   * Obtener empleado por código
   * GET /api/empleados/codigo/:codigo
   */
  obtenerPorCodigo = catchAsync(async (req, res) => {
    const { codigo } = req.params;
    const empleado = await EmpleadoService.obtenerEmpleadoPorCodigo(codigo);

    res.json(responseFormatter.success(
      empleado,
      'Empleado encontrado'
    ));
  });

  /**
   * Crear empleado
   * POST /api/empleados
   */
  crear = catchAsync(async (req, res) => {
    const empleado = await EmpleadoService.crearEmpleado(
      req.body,
      req.usuario?.nombre || 'SISTEMA'
    );

    res.status(HTTP_STATUS.CREATED).json(responseFormatter.created(
      empleado,
      SUCCESS_MESSAGES.EMPLEADO_CREADO
    ));
  });

  /**
   * Actualizar empleado
   * PUT /api/empleados/:id
   */
  actualizar = catchAsync(async (req, res) => {
    const { id } = req.params;
    const empleado = await EmpleadoService.actualizarEmpleado(
      id,
      req.body,
      req.usuario?.nombre || 'SISTEMA'
    );

    res.json(responseFormatter.success(
      empleado,
      SUCCESS_MESSAGES.EMPLEADO_ACTUALIZADO
    ));
  });

  /**
   * Eliminar empleado (soft delete)
   * DELETE /api/empleados/:id
   */
  eliminar = catchAsync(async (req, res) => {
    const { id } = req.params;
    await EmpleadoService.eliminarEmpleado(id, req.usuario?.nombre || 'SISTEMA');

    res.json(responseFormatter.deleted(SUCCESS_MESSAGES.EMPLEADO_ELIMINADO));
  });

  /**
   * Buscar empleados
   * GET /api/empleados/buscar
   */
  buscar = catchAsync(async (req, res) => {
    const { q, pagina, limite } = req.query;
    const resultados = await EmpleadoService.buscarEmpleados(q, pagina, limite);

    res.json(responseFormatter.paginated(
      resultados.data,
      {
        total: resultados.total,
        page: resultados.pagina,
        limit: resultados.limite,
        pages: Math.ceil(resultados.total / resultados.limite)
      },
      'Búsqueda completada'
    ));
  });

  /**
   * Obtener estadísticas de empleados
   * GET /api/empleados/estadisticas
   */
  estadisticas = catchAsync(async (req, res) => {
    const estadisticas = await EmpleadoService.obtenerEstadisticas();

    res.json(responseFormatter.success(
      estadisticas,
      'Estadísticas de empleados'
    ));
  });

  /**
   * Actualizar salarios masivamente
   * POST /api/empleados/salarios-masivo
   */
  actualizarSalariosMasivo = catchAsync(async (req, res) => {
    const { empleadosIds, nuevoSalario } = req.body;
    
    const resultados = await EmpleadoService.actualizarSalariosMasivo(
      empleadosIds,
      nuevoSalario,
      req.usuario?.nombre || 'SISTEMA'
    );

    res.json(responseFormatter.success(
      resultados,
      `${resultados.length} salarios actualizados correctamente`
    ));
  });

  /**
   * Exportar empleados
   * GET /api/empleados/exportar
   */
  exportar = catchAsync(async (req, res) => {
    const { formato = 'csv' } = req.query;
    
    const datos = await EmpleadoService.exportarEmpleados(formato);

    if (formato === 'json') {
      res.json(responseFormatter.success(datos, 'Exportación completada'));
    } else {
      // Para CSV, enviar como archivo
      const csvContent = this._generarCSV(datos);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=empleados.csv');
      res.send(csvContent);
    }
  });

  /**
   * Generar CSV (método auxiliar)
   */
  _generarCSV(datos) {
    if (!datos.length) return '';
    
    const headers = Object.keys(datos[0]).join(',');
    const rows = datos.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
}

export default new EmpleadoController();