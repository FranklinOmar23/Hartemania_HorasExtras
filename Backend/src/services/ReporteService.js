// src/services/ReporteService.js
import ResumenQuincenalRepository from '../repositories/ResumenQuincenalRepository.js';
import RegistroAsistenciaRepository from '../repositories/RegistroAsistenciaRepository.js';
import EmpleadoRepository from '../repositories/EmpleadoRepository.js';
import ImportacionRepository from '../repositories/ImportacionRepository.js';
import logger from '../middleware/logger.js';
import { HTTP_STATUS } from '../utils/constants.js';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReporteService {
  /**
   * Generar reporte de horas extras por quincena
   */
  async generarReporteQuincenal(anio, mes, quincena, formato = 'json') {
    try {
      // Obtener datos
      const resumenes = await ResumenQuincenalRepository.findByPeriodo(
        anio,
        mes,
        quincena,
        true
      );

      const totales = await ResumenQuincenalRepository.getTotalesPorPeriodo(
        anio,
        mes,
        quincena
      );

      const datos = {
        encabezado: {
          titulo: `Reporte de Horas Extras - ${this._getNombreQuincena(mes, quincena)} ${anio}`,
          fechaGeneracion: moment().format('YYYY-MM-DD HH:mm:ss'),
          periodo: {
            anio,
            mes,
            quincena,
            fechaInicio: this._obtenerFechasQuincena(anio, mes, quincena).inicio,
            fechaFin: this._obtenerFechasQuincena(anio, mes, quincena).fin
          }
        },
        resumen: {
          totalEmpleados: totales?.TotalEmpleados || 0,
          totalHoras: {
            '35%': totales?.TotalHoras35 || 0,
            '100%': totales?.TotalHoras100 || 0,
            '15%': totales?.TotalHoras15 || 0,
            feriado: totales?.TotalHorasFeriado || 0,
            total: totales?.TotalHoras || 0
          },
          totalPagar: totales?.TotalPagar || 0
        },
        detalle: resumenes.map(r => ({
          empleado: {
            codigo: r.Empleado?.Codigo,
            nombre: r.Empleado?.NombreCompleto,
            posicion: r.Empleado?.Posicion
          },
          horas: {
            '35%': r.Horas35,
            '100%': r.Horas100,
            '15%': r.Horas15,
            feriado: r.HorasFeriado,
            total: r.TotalHoras
          },
          montos: {
            '35%': r.Monto35,
            '100%': r.Monto100,
            '15%': r.Monto15,
            feriado: r.MontoFeriado,
            total: r.TotalPagar
          }
        }))
      };

      // Formatear según tipo
      return await this._formatearReporte(datos, formato, 'quincenal');
    } catch (error) {
      logger.error('Error al generar reporte quincenal', error);
      throw error;
    }
  }

  /**
   * Generar reporte mensual
   */
  async generarReporteMensual(anio, mes, formato = 'json') {
    try {
      const quincena1 = await this.generarReporteQuincenal(anio, mes, 1, 'json');
      const quincena2 = await this.generarReporteQuincenal(anio, mes, 2, 'json');

      const datos = {
        encabezado: {
          titulo: `Reporte Mensual de Horas Extras - ${moment(`${anio}-${mes}-01`).format('MMMM YYYY')}`,
          fechaGeneracion: moment().format('YYYY-MM-DD HH:mm:ss'),
          periodo: {
            anio,
            mes,
            nombre: moment(`${anio}-${mes}-01`).format('MMMM YYYY')
          }
        },
        quincenas: {
          primera: quincena1,
          segunda: quincena2
        },
        totalMensual: {
          totalEmpleados: Math.max(
            quincena1.resumen?.totalEmpleados || 0,
            quincena2.resumen?.totalEmpleados || 0
          ),
          totalHoras: (quincena1.resumen?.totalHoras?.total || 0) + 
                      (quincena2.resumen?.totalHoras?.total || 0),
          totalPagar: (quincena1.resumen?.totalPagar || 0) + 
                      (quincena2.resumen?.totalPagar || 0)
        }
      };

      return await this._formatearReporte(datos, formato, 'mensual');
    } catch (error) {
      logger.error('Error al generar reporte mensual', error);
      throw error;
    }
  }

  /**
   * Generar reporte anual
   */
  async generarReporteAnual(anio, formato = 'json') {
    try {
      const meses = Array.from({ length: 12 }, (_, i) => i + 1);
      const reportesMensuales = [];

      for (const mes of meses) {
        try {
          const reporte = await this.generarReporteMensual(anio, mes, 'json');
          reportesMensuales.push(reporte);
        } catch (error) {
          reportesMensuales.push({
            mes,
            error: 'Sin datos'
          });
        }
      }

      const totalesAnuales = reportesMensuales.reduce((acc, r) => {
        if (r.totalMensual) {
          acc.totalEmpleados = Math.max(acc.totalEmpleados, r.totalMensual.totalEmpleados);
          acc.totalHoras += r.totalMensual.totalHoras;
          acc.totalPagar += r.totalMensual.totalPagar;
        }
        return acc;
      }, { totalEmpleados: 0, totalHoras: 0, totalPagar: 0 });

      const datos = {
        encabezado: {
          titulo: `Reporte Anual de Horas Extras - ${anio}`,
          fechaGeneracion: moment().format('YYYY-MM-DD HH:mm:ss'),
          periodo: { anio }
        },
        meses: reportesMensuales.map((r, idx) => ({
          mes: idx + 1,
          nombre: moment(`${anio}-${idx + 1}-01`).format('MMMM'),
          ...r
        })),
        totalAnual: totalesAnuales
      };

      return await this._formatearReporte(datos, formato, 'anual');
    } catch (error) {
      logger.error('Error al generar reporte anual', error);
      throw error;
    }
  }

  /**
   * Generar reporte por empleado
   */
  async generarReporteEmpleado(empleadoId, fechaInicio, fechaFin, formato = 'json') {
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

      const resumenes = await ResumenQuincenalRepository.getHistoricoEmpleado(empleadoId, 100);

      const datos = {
        encabezado: {
          titulo: `Reporte de Horas Extras - ${empleado.NombreCompleto}`,
          fechaGeneracion: moment().format('YYYY-MM-DD HH:mm:ss'),
          empleado: empleado.toJSON(),
          periodo: {
            inicio: fechaInicio,
            fin: fechaFin
          }
        },
        registros: registros.map(r => ({
          fecha: r.Fecha,
          entrada: r.HoraEntrada,
          salida: r.HoraSalida,
          horasTrabajadas: r.calcularHorasTrabajadas(),
          procesado: r.Procesado,
          comentarios: r.Comentarios
        })),
        resumenQuincenas: resumenes.map(r => r.toJSON()),
        totales: {
          totalRegistros: registros.length,
          totalHoras: resumenes.reduce((acc, r) => acc + r.TotalHoras, 0),
          totalPagar: resumenes.reduce((acc, r) => acc + r.TotalPagar, 0)
        }
      };

      return await this._formatearReporte(datos, formato, 'empleado');
    } catch (error) {
      logger.error('Error al generar reporte de empleado', error);
      throw error;
    }
  }

  /**
   * Generar reporte de importaciones
   */
  async generarReporteImportaciones(fechaInicio, fechaFin, formato = 'json') {
    try {
      const importaciones = await ImportacionRepository.findByPeriodo(
        fechaInicio,
        fechaFin,
        1,
        1000
      );

      const resumen = await ImportacionRepository.getResumen();

      const datos = {
        encabezado: {
          titulo: 'Reporte de Importaciones',
          fechaGeneracion: moment().format('YYYY-MM-DD HH:mm:ss'),
          periodo: {
            inicio: fechaInicio,
            fin: fechaFin
          }
        },
        resumen,
        importaciones: importaciones.data.map(i => i.toJSON()),
        totales: {
          totalImportaciones: importaciones.total,
          totalRegistros: importaciones.data.reduce((acc, i) => acc + i.TotalRegistros, 0),
          totalValidos: importaciones.data.reduce((acc, i) => acc + i.RegistrosValidos, 0),
          totalErrores: importaciones.data.reduce((acc, i) => acc + i.RegistrosError, 0)
        }
      };

      return await this._formatearReporte(datos, formato, 'importaciones');
    } catch (error) {
      logger.error('Error al generar reporte de importaciones', error);
      throw error;
    }
  }

  /**
   * Formatear reporte según tipo
   */
  async _formatearReporte(datos, formato, tipo) {
    switch (formato) {
      case 'json':
        return datos;

      case 'csv':
        return this._generarCSV(datos, tipo);

      case 'excel':
        return await this._generarExcel(datos, tipo);

      case 'pdf':
        return await this._generarPDF(datos, tipo);

      default:
        return datos;
    }
  }

  /**
   * Generar CSV
   */
  _generarCSV(datos, tipo) {
    let csv = '';
    const filename = `reporte_${tipo}_${moment().format('YYYYMMDD_HHmmss')}.csv`;

    if (tipo === 'quincenal' && datos.detalle) {
      // Encabezados
      csv = 'Código,Empleado,Posición,HE 35%,HE 100%,HE 15%,HE Feriado,Total Horas,Monto 35%,Monto 100%,Monto 15%,Monto Feriado,Total Pagar\n';
      
      // Datos
      datos.detalle.forEach(item => {
        csv += `${item.empleado.codigo},${item.empleado.nombre},${item.empleado.posicion || ''},`;
        csv += `${item.horas['35%'].toFixed(2)},${item.horas['100%'].toFixed(2)},`;
        csv += `${item.horas['15%'].toFixed(2)},${item.horas.feriado.toFixed(2)},`;
        csv += `${item.horas.total.toFixed(2)},${item.montos['35%'].toFixed(2)},`;
        csv += `${item.montos['100%'].toFixed(2)},${item.montos['15%'].toFixed(2)},`;
        csv += `${item.montos.feriado.toFixed(2)},${item.montos.total.toFixed(2)}\n`;
      });
    }

    return {
      filename,
      content: csv,
      contentType: 'text/csv'
    };
  }

  /**
   * Generar Excel (placeholder - implementar con xlsx)
   */
  async _generarExcel(datos, tipo) {
    // Aquí usarías la librería xlsx para generar el Excel
    // Por ahora retornamos los datos
    const filename = `reporte_${tipo}_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
    
    return {
      filename,
      datos,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }

  /**
   * Generar PDF (placeholder - implementar con pdfkit)
   */
  async _generarPDF(datos, tipo) {
    const filename = `reporte_${tipo}_${moment().format('YYYYMMDD_HHmmss')}.pdf`;
    
    return {
      filename,
      datos,
      contentType: 'application/pdf'
    };
  }

  /**
   * Exportar reporte a archivo
   */
  async exportarReporte(datos, tipo, formato) {
    const resultado = await this._formatearReporte(datos, formato, tipo);
    
    // Guardar archivo temporal
    const tempDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, resultado.filename);
    
    if (formato === 'csv') {
      fs.writeFileSync(filePath, resultado.content);
    } else {
      fs.writeFileSync(filePath, JSON.stringify(resultado.datos, null, 2));
    }

    return {
      ...resultado,
      filePath
    };
  }

  /**
   * Obtener fechas de quincena
   */
  _obtenerFechasQuincena(anio, mes, quincena) {
    if (quincena === 1) {
      return {
        inicio: moment(`${anio}-${mes}-01`).format('YYYY-MM-DD'),
        fin: moment(`${anio}-${mes}-15`).format('YYYY-MM-DD')
      };
    } else {
      const ultimoDia = moment(`${anio}-${mes}-01`).endOf('month').date();
      return {
        inicio: moment(`${anio}-${mes}-16`).format('YYYY-MM-DD'),
        fin: moment(`${anio}-${mes}-${ultimoDia}`).format('YYYY-MM-DD')
      };
    }
  }

  /**
   * Obtener nombre de quincena
   */
  _getNombreQuincena(mes, quincena) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const nombreMes = meses[mes - 1];
    return quincena === 1 
      ? `Primera quincena de ${nombreMes}`
      : `Segunda quincena de ${nombreMes}`;
  }
}

export default new ReporteService();