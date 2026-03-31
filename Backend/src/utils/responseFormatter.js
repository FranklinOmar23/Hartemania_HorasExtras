// src/utils/responseFormatter.js
class ResponseFormatter {
  /**
   * Formatear respuesta exitosa
   */
  success(data = null, message = '', meta = {}) {
    const response = {
      success: true,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    if (message) {
      response.message = message;
    }

    // Agregar metadatos adicionales
    if (Object.keys(meta).length > 0) {
      response.meta = meta;
    }

    return response;
  }

  /**
   * Formatear respuesta con paginación
   */
  paginated(data, pagination, message = '') {
    return {
      success: true,
      data,
      pagination: {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        pages: pagination.pages,
        hasNext: pagination.page < pagination.pages,
        hasPrev: pagination.page > 1
      },
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formatear error
   */
  error(error, code = 500, details = null) {
    const response = {
      success: false,
      error: error.message || error,
      code,
      timestamp: new Date().toISOString()
    };

    if (details) {
      response.details = details;
    }

    // En desarrollo, incluir stack trace
    if (process.env.NODE_ENV === 'development' && error.stack) {
      response.stack = error.stack;
    }

    return response;
  }

  /**
   * Formatear error de validación
   */
  validationError(errors) {
    return {
      success: false,
      error: 'Error de validación',
      code: 400,
      details: errors.map(err => ({
        field: err.path || err.param,
        value: err.value,
        message: err.msg
      })),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formatear respuesta de creación
   */
  created(data, message = 'Recurso creado exitosamente') {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formatear respuesta de actualización
   */
  updated(data, message = 'Recurso actualizado exitosamente') {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formatear respuesta de eliminación
   */
  deleted(message = 'Recurso eliminado exitosamente') {
    return {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formatear respuesta de importación
   */
  importResult(result) {
    const totalExitosos = result.exitosos?.length || 0;
    const totalErrores = result.errores?.length || 0;
    const duplicados = (result.errores || []).filter(e => e.error && e.error.includes('Ya existe')).length;

    return {
      success: true,
      data: {
        id: result.importacion?.Id || result.importacion?.id,
        fecha: result.importacion?.FechaCreacion || new Date().toISOString(),
        totalRegistros: totalExitosos + totalErrores,
        registrosValidos: totalExitosos,
        registrosError: totalErrores,
        duplicados,
        mensaje: `Se procesaron ${totalExitosos + totalErrores} registros: ${totalExitosos} exitosos, ${totalErrores} errores`,
        importacion: result.importacion,
        errores: result.errores
      },
      message: `Importacion completada con ${totalExitosos} exitosos y ${totalErrores} errores`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formatear respuesta de cálculo
   */
  calculationResult(result) {
    return {
      success: true,
      data: {
        registro: result.registro,
        empleado: result.empleado,
        calculos: result.calculos,
        resumen: result.resumen
      },
      message: 'Cálculo realizado exitosamente',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formatear respuesta de reporte
   */
  report(reporte, formato = 'json') {
    if (formato === 'json') {
      return {
        success: true,
        data: reporte,
        timestamp: new Date().toISOString()
      };
    }

    // Para otros formatos (csv, excel, pdf) retornar el archivo
    return reporte;
  }

  /**
   * Formatear respuesta de error de negocio
   */
  businessError(message, code = 400, details = null) {
    return {
      success: false,
      error: message,
      code,
      type: 'BUSINESS_ERROR',
      details,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formatear respuesta de advertencia
   */
  warning(message, data = null) {
    return {
      success: true,
      warning: message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formatear respuesta vacía (204)
   */
  noContent() {
    return null;
  }

  /**
   * Formatear respuesta para descarga de archivo
   */
  file(content, filename, contentType) {
    return {
      content,
      filename,
      contentType
    };
  }
}

export default new ResponseFormatter();