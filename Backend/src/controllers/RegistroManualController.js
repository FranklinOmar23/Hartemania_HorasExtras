// src/controllers/RegistroManualController.js
import { catchAsync } from '../middleware/errorHandler.js';
import RegistroManualService from '../services/RegistroManualService.js';
import RegistroAsistenciaRepository from '../repositories/RegistroAsistenciaRepository.js';
import responseFormatter from '../utils/responseFormatter.js';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants.js';
import dateHelpers from '../utils/dateHelpers.js';

class RegistroManualController {
  /**
   * Listar todos los registros con filtros opcionales
   * GET /api/registros
   */
  listarTodos = catchAsync(async (req, res) => {
    const resultado = await RegistroAsistenciaRepository.findAllFiltered(req.query);

    res.json(responseFormatter.paginated(
      resultado.data,
      {
        total: resultado.total,
        page: resultado.pagina,
        limit: resultado.limite,
        pages: resultado.pages
      },
      'Registros encontrados'
    ));
  });

  /**
   * Crear registro manual
   * POST /api/registros/manual
   */
  crear = catchAsync(async (req, res) => {
    const registro = await RegistroManualService.crearRegistroManual(
      req.body,
      req.usuario?.nombre || 'SISTEMA'
    );

    res.status(HTTP_STATUS.CREATED).json(responseFormatter.created(
      registro,
      'Registro manual creado correctamente'
    ));
  });

  /**
   * Actualizar registro manual
   * PUT /api/registros/manual/:id
   */
  actualizar = catchAsync(async (req, res) => {
    const { id } = req.params;
    const registro = await RegistroManualService.actualizarRegistroManual(
      id,
      req.body,
      req.usuario?.nombre || 'SISTEMA'
    );

    res.json(responseFormatter.success(
      registro,
      'Registro manual actualizado correctamente'
    ));
  });

  /**
   * Eliminar registro manual
   * DELETE /api/registros/manual/:id
   */
  eliminar = catchAsync(async (req, res) => {
    const { id } = req.params;
    await RegistroManualService.eliminarRegistroManual(id);

    res.json(responseFormatter.deleted('Registro manual eliminado correctamente'));
  });

  /**
   * Obtener registro por ID
   * GET /api/registros/:id
   */
  obtener = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { incluirCalculos } = req.query;

    const registro = await RegistroAsistenciaRepository.obtenerPorId(
      id,
      incluirCalculos === 'true'
    );

    if (!registro) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Registro no encontrado'
      });
    }

    res.json(responseFormatter.success(
      registro,
      'Registro encontrado'
    ));
  });

  /**
   * Listar registros por empleado
   * GET /api/registros/empleado/:empleadoId
   */
  listarPorEmpleado = catchAsync(async (req, res) => {
    const { empleadoId } = req.params;
    const { fechaInicio, fechaFin, procesado } = req.query;

    let registros = await RegistroManualService.obtenerRegistrosPorEmpleado(
      empleadoId,
      fechaInicio,
      fechaFin
    );

    // Filtrar por procesado si se especifica
    if (procesado !== undefined) {
      const esProcesado = procesado === 'true';
      registros = registros.filter(r => r.Procesado === esProcesado);
    }

    res.json(responseFormatter.success(
      registros,
      'Registros encontrados'
    ));
  });

  /**
   * Marcar entrada
   * POST /api/registros/entrada
   */
  marcarEntrada = catchAsync(async (req, res) => {
    const { empleadoId, fecha, horaEntrada } = req.body;

    const registro = await RegistroManualService.marcarEntrada(
      empleadoId,
      fecha || dateHelpers.getToday(),
      horaEntrada || dateHelpers.formatTime(new Date()),
      req.usuario?.nombre || 'SISTEMA'
    );

    res.status(HTTP_STATUS.CREATED).json(responseFormatter.success(
      registro,
      'Entrada marcada correctamente'
    ));
  });

  /**
   * Marcar salida
   * POST /api/registros/salida
   */
  marcarSalida = catchAsync(async (req, res) => {
    const { empleadoId, fecha, horaSalida } = req.body;

    const registro = await RegistroManualService.marcarSalida(
      empleadoId,
      fecha || dateHelpers.getToday(),
      horaSalida || dateHelpers.formatTime(new Date()),
      req.usuario?.nombre || 'SISTEMA'
    );

    res.json(responseFormatter.success(
      registro,
      'Salida marcada correctamente'
    ));
  });

  /**
   * Obtener registros pendientes
   * GET /api/registros/pendientes
   */
  pendientes = catchAsync(async (req, res) => {
    const { fechaInicio, fechaFin, pagina = 1, limite = 20 } = req.query;

    const inicio = fechaInicio || dateHelpers.getFirstDayOfMonth(
      new Date().getFullYear(),
      new Date().getMonth() + 1
    );
    
    const fin = fechaFin || dateHelpers.getToday();

    const registros = await RegistroAsistenciaRepository.findSinProcesar(
      inicio,
      fin
    );

    // Aplicar paginación manual
    const start = (pagina - 1) * limite;
    const paginados = registros.slice(start, start + parseInt(limite));

    res.json(responseFormatter.paginated(
      paginados,
      {
        total: registros.length,
        page: parseInt(pagina),
        limit: parseInt(limite),
        pages: Math.ceil(registros.length / limite)
      },
      'Registros pendientes'
    ));
  });

  /**
   * Obtener estadísticas de registros
   * GET /api/registros/estadisticas/:empleadoId
   */
  estadisticas = catchAsync(async (req, res) => {
    const { empleadoId } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Debe proporcionar fecha inicio y fecha fin'
      });
    }

    const estadisticas = await RegistroAsistenciaRepository.getEstadisticasPorEmpleado(
      empleadoId,
      fechaInicio,
      fechaFin
    );

    res.json(responseFormatter.success(
      estadisticas,
      'Estadísticas de registros'
    ));
  });

  /**
   * Crear registros masivos
   * POST /api/registros/masivo
   */
  crearMasivo = catchAsync(async (req, res) => {
    const { registros } = req.body;

    const resultados = await RegistroAsistenciaRepository.crearMultiples(
      registros.map(r => ({
        ...r,
        UsuarioCreacion: req.usuario?.nombre || 'SISTEMA'
      }))
    );

    res.status(HTTP_STATUS.CREATED).json(responseFormatter.success(
      {
        exitosos: resultados.exitosos.length,
        errores: resultados.errores.length,
        detalles: resultados
      },
      `${resultados.exitosos.length} registros creados correctamente`
    ));
  });

  /**
   * Verificar si existe registro
   * GET /api/registros/existe
   */
  verificarExistencia = catchAsync(async (req, res) => {
    const { empleadoId, fecha } = req.query;

    if (!empleadoId || !fecha) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Debe proporcionar empleadoId y fecha'
      });
    }

    const existe = await RegistroAsistenciaRepository.existeRegistro(
      empleadoId,
      fecha
    );

    res.json(responseFormatter.success(
      { existe, empleadoId, fecha },
      existe ? 'Ya existe un registro' : 'No existe registro'
    ));
  });
}

export default new RegistroManualController();