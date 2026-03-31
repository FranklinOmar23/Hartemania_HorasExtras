import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Download, Calendar, Users, BarChart3 } from 'lucide-react';
import ReporteSelector from '../components/ReporteSelector';
import ReporteQuincenal from '../components/ReporteQuincenal';
import ReporteEmpleado from '../components/ReporteEmpleado';
import ReportePreview from '../components/ReportePreview';
import ExportButtons from '../components/ExportButtons';
import { Card, Tabs, Alert } from '../../../components/common';
import { useUIStore } from '../../../store';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ============================================
// PÁGINA PRINCIPAL DE REPORTES
// ============================================

const ReportesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useUIStore();
  
  // Estado
  const [activeTab, setActiveTab] = useState('quincenal');
  const [reporteData, setReporteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parametros, setParametros] = useState(null);

  const tabFromLocation = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const queryTab = params.get('tab');
    const allowedTabs = ['quincenal', 'empleado', 'comparativo'];

    if (allowedTabs.includes(queryTab)) {
      return queryTab;
    }

    if (location.pathname.endsWith('/quincenal')) return 'quincenal';
    if (location.pathname.endsWith('/empleado')) return 'empleado';
    if (location.pathname.endsWith('/comparativo')) return 'comparativo';

    return 'quincenal';
  }, [location.pathname, location.search]);

  useEffect(() => {
    setActiveTab(tabFromLocation);
  }, [tabFromLocation]);

  // ========================================
  // GENERAR REPORTE
  // ========================================
  const generarReporte = async (params) => {
    setLoading(true);
    setError(null);
    setParametros(params);

    try {
      // Simular llamada API (reemplazar con servicio real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Datos de ejemplo
      const mockData = generarMockData(params);
      setReporteData(mockData);
      
      showToast({
        type: 'success',
        message: 'Reporte generado correctamente'
      });
    } catch (err) {
      setError(err.message);
      showToast({
        type: 'error',
        message: 'Error al generar el reporte'
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // GENERAR DATOS DE EJEMPLO
  // ========================================
  const generarMockData = (params) => {
    const { tipo, anio, mes, quincena, empleadoId } = params;

    const baseData = {
      parametros: params,
      fechaGeneracion: new Date().toISOString(),
      usuario: 'Admin User'
    };

    if (tipo === 'quincenal') {
      return {
        ...baseData,
        tipo: 'QUINCENAL',
        titulo: `Reporte Quincenal - ${mes}/${anio} - Quincena ${quincena}`,
        resumen: {
          totalEmpleados: 45,
          empleadosConHE: 32,
          totalHoras: 156.5,
          totalPagar: 84750.25,
          horasPorTipo: {
            he35: 98.5,
            he100: 42.0,
            he15: 16.0,
            feriado: 0
          },
          montosPorTipo: {
            he35: 49875.50,
            he100: 28350.00,
            he15: 6524.75,
            feriado: 0
          }
        },
        empleados: [
          { id: 1, codigo: 'EMP001', nombre: 'Juan Pérez', horas35: 12.5, horas100: 4, horas15: 2, totalHoras: 18.5, monto35: 6250.00, monto100: 2800.00, monto15: 850.00, totalPagar: 9900.00 },
          { id: 2, codigo: 'EMP002', nombre: 'María García', horas35: 8, horas100: 0, horas15: 0, totalHoras: 8, monto35: 4000.00, monto100: 0, monto15: 0, totalPagar: 4000.00 },
          { id: 3, codigo: 'EMP003', nombre: 'Pedro Rodríguez', horas35: 15, horas100: 8, horas15: 4, totalHoras: 27, monto35: 7500.00, monto100: 5600.00, monto15: 1700.00, totalPagar: 14800.00 },
          { id: 4, codigo: 'EMP004', nombre: 'Ana Martínez', horas35: 6.5, horas100: 2, horas15: 1, totalHoras: 9.5, monto35: 3250.00, monto100: 1400.00, monto15: 425.00, totalPagar: 5075.00 },
          { id: 5, codigo: 'EMP005', nombre: 'Carlos López', horas35: 10, horas100: 6, horas15: 3, totalHoras: 19, monto35: 5000.00, monto100: 4200.00, monto15: 1275.00, totalPagar: 10475.00 }
        ]
      };
    } else if (tipo === 'empleado') {
      const empleado = empleadoId === '1' 
        ? { id: 1, codigo: 'EMP001', nombre: 'Juan Pérez', posicion: 'Coordinador', departamento: 'Taller' }
        : { id: 2, codigo: 'EMP002', nombre: 'María García', posicion: 'Instalador', departamento: 'Instalación' };

      return {
        ...baseData,
        tipo: 'EMPLEADO',
        titulo: `Reporte de Horas Extras - ${empleado.nombre}`,
        empleado,
        periodo: `${mes}/${anio}`,
        resumen: {
          totalHoras: 45.5,
          totalPagar: 22750.00,
          horasPorTipo: {
            he35: 28.5,
            he100: 12.0,
            he15: 5.0,
            feriado: 0
          }
        },
        registros: [
          { fecha: '2026-02-01', entrada: '08:30', salida: '18:30', horas35: 2, horas100: 0, horas15: 0, totalHoras: 2, monto: 1000.00 },
          { fecha: '2026-02-02', entrada: '08:30', salida: '20:00', horas35: 3.5, horas100: 0, horas15: 1, totalHoras: 4.5, monto: 2250.00 },
          { fecha: '2026-02-03', entrada: '08:30', salida: '19:00', horas35: 2.5, horas100: 0, horas15: 0, totalHoras: 2.5, monto: 1250.00 },
          { fecha: '2026-02-04', entrada: '08:30', salida: '21:00', horas35: 3, horas100: 0, horas15: 2, totalHoras: 5, monto: 2500.00 },
          { fecha: '2026-02-05', entrada: '08:30', salida: '22:00', horas35: 3, horas100: 0, horas15: 3, totalHoras: 6, monto: 3000.00 },
          { fecha: '2026-02-06', entrada: '08:30', salida: '19:30', horas35: 3, horas100: 0, horas15: 0, totalHoras: 3, monto: 1500.00 },
          { fecha: '2026-02-07', entrada: '09:00', salida: '15:00', horas35: 0, horas100: 2, horas15: 0, totalHoras: 2, monto: 1400.00 }
        ]
      };
    } else if (tipo === 'comparativo') {
      return {
        ...baseData,
        tipo: 'COMPARATIVO',
        titulo: `Reporte Comparativo ${anio}`,
        periodos: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datos: [
          { mes: 'Ene', horas: 120, monto: 60000 },
          { mes: 'Feb', horas: 145, monto: 72500 },
          { mes: 'Mar', horas: 135, monto: 67500 },
          { mes: 'Abr', horas: 160, monto: 80000 },
          { mes: 'May', horas: 140, monto: 70000 },
          { mes: 'Jun', horas: 155, monto: 77500 }
        ]
      };
    }

    return baseData;
  };

  // ========================================
  // EXPORTAR REPORTE
  // ========================================
  const exportarReporte = async (formato) => {
    if (!reporteData) {
      showToast({
        type: 'warning',
        message: 'No hay reporte para exportar'
      });
      return;
    }

    setLoading(true);

    try {
      if (formato === 'excel') {
        await exportarExcel(reporteData);
      } else if (formato === 'pdf') {
        await exportarPDF(reporteData);
      } else if (formato === 'csv') {
        await exportarCSV(reporteData);
      }

      showToast({
        type: 'success',
        message: `Reporte exportado como ${formato.toUpperCase()}`
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al exportar el reporte'
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // EXPORTAR A EXCEL
  // ========================================
  const exportarExcel = async (data) => {
    const wb = XLSX.utils.book_new();

    if (data.tipo === 'QUINCENAL') {
      // Hoja de resumen
      const resumenData = [
        [data.titulo],
        [`Generado: ${new Date(data.fechaGeneracion).toLocaleString()}`],
        [],
        ['Resumen General'],
        ['Total Empleados', 'Con HE', 'Total Horas', 'Total a Pagar'],
        [data.resumen.totalEmpleados, data.resumen.empleadosConHE, data.resumen.totalHoras, data.resumen.totalPagar],
        [],
        ['Horas por Tipo'],
        ['35%', '100%', '15%', 'Feriado'],
        [data.resumen.horasPorTipo.he35, data.resumen.horasPorTipo.he100, data.resumen.horasPorTipo.he15, data.resumen.horasPorTipo.feriado],
        [],
        ['Montos por Tipo'],
        ['35%', '100%', '15%', 'Feriado', 'Total'],
        [data.resumen.montosPorTipo.he35, data.resumen.montosPorTipo.he100, data.resumen.montosPorTipo.he15, data.resumen.montosPorTipo.feriado, data.resumen.totalPagar]
      ];

      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Hoja de detalle
      const detalleData = [
        ['Código', 'Empleado', 'HE 35%', 'HE 100%', 'HE 15%', 'Total Horas', 'Monto 35%', 'Monto 100%', 'Monto 15%', 'Total Pagar'],
        ...data.empleados.map(emp => [
          emp.codigo,
          emp.nombre,
          emp.horas35,
          emp.horas100,
          emp.horas15,
          emp.totalHoras,
          emp.monto35,
          emp.monto100,
          emp.monto15,
          emp.totalPagar
        ])
      ];

      const wsDetalle = XLSX.utils.aoa_to_sheet(detalleData);
      XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');

    } else if (data.tipo === 'EMPLEADO') {
      const empleadoData = [
        [data.titulo],
        [`Empleado: ${data.empleado.nombre} (${data.empleado.codigo})`],
        [`Posición: ${data.empleado.posicion}`],
        [`Departamento: ${data.empleado.departamento}`],
        [`Período: ${data.periodo}`],
        [`Generado: ${new Date(data.fechaGeneracion).toLocaleString()}`],
        [],
        ['Resumen'],
        ['Total Horas', 'Total a Pagar', 'HE 35%', 'HE 100%', 'HE 15%'],
        [data.resumen.totalHoras, data.resumen.totalPagar, data.resumen.horasPorTipo.he35, data.resumen.horasPorTipo.he100, data.resumen.horasPorTipo.he15],
        [],
        ['Registros Diarios'],
        ['Fecha', 'Entrada', 'Salida', 'HE 35%', 'HE 100%', 'HE 15%', 'Total Horas', 'Monto'],
        ...data.registros.map(reg => [
          reg.fecha,
          reg.entrada,
          reg.salida,
          reg.horas35,
          reg.horas100,
          reg.horas15,
          reg.totalHoras,
          reg.monto
        ])
      ];

      const wsEmpleado = XLSX.utils.aoa_to_sheet(empleadoData);
      XLSX.utils.book_append_sheet(wb, wsEmpleado, 'Reporte Empleado');
    }

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `reporte_${Date.now()}.xlsx`);
  };

  // ========================================
  // EXPORTAR A PDF
  // ========================================
  const exportarPDF = async (data) => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text(data.titulo, 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date(data.fechaGeneracion).toLocaleString()}`, 14, 30);
    
    if (data.tipo === 'QUINCENAL') {
      // Resumen
      doc.setFontSize(12);
      doc.text('Resumen General', 14, 45);
      
      doc.autoTable({
        startY: 50,
        head: [['Concepto', 'Valor']],
        body: [
          ['Total Empleados', data.resumen.totalEmpleados],
          ['Empleados con HE', data.resumen.empleadosConHE],
          ['Total Horas', data.resumen.totalHoras],
          ['Total a Pagar', `RD$ ${data.resumen.totalPagar.toFixed(2)}`]
        ]
      });

      // Detalle por empleado
      doc.text('Detalle por Empleado', 14, doc.lastAutoTable.finalY + 15);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Código', 'Empleado', 'HE 35%', 'HE 100%', 'HE 15%', 'Total Horas', 'Total Pagar']],
        body: data.empleados.map(emp => [
          emp.codigo,
          emp.nombre,
          emp.horas35,
          emp.horas100,
          emp.horas15,
          emp.totalHoras,
          `RD$ ${emp.totalPagar.toFixed(2)}`
        ])
      });
    }

    doc.save(`reporte_${Date.now()}.pdf`);
  };

  // ========================================
  // EXPORTAR A CSV
  // ========================================
  const exportarCSV = async (data) => {
    let csvContent = '';
    
    if (data.tipo === 'QUINCENAL') {
      csvContent = 'Código,Empleado,HE 35%,HE 100%,HE 15%,Total Horas,Total Pagar\n';
      data.empleados.forEach(emp => {
        csvContent += `${emp.codigo},${emp.nombre},${emp.horas35},${emp.horas100},${emp.horas15},${emp.totalHoras},${emp.totalPagar}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `reporte_${Date.now()}.csv`);
  };

  // ========================================
  // VER REPORTE COMPLETO
  // ========================================
  const verReporteCompleto = () => {
    navigate('/reportes/generado', { state: { reporteData, parametros } });
  };

  // ========================================
  // RENDER
  // ========================================
  const tabs = [
    { id: 'quincenal', label: 'Quincenal', icon: Calendar },
    { id: 'empleado', label: 'Por Empleado', icon: Users },
    { id: 'comparativo', label: 'Comparativo', icon: BarChart3 }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setReporteData(null);
    navigate(`/reportes?tab=${tabId}`, { replace: false });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[30px] border border-slate-200 bg-gradient-to-r from-white via-white to-emerald-50 px-6 py-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-500 mt-1">
          Genera y exporta reportes de horas extras
        </p>
      </div>

      {/* Selector de tipo de reporte */}
      <Card className="rounded-[30px] border border-slate-200 shadow-sm">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon size={18} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <ReporteSelector
          tipo={activeTab}
          onGenerar={generarReporte}
          loading={loading}
        />
      </Card>

      {/* Error */}
      {error && (
        <Alert type="error" title="Error" message={error} dismissible />
      )}

      {/* Preview del reporte */}
      {reporteData && (
        <Card className="rounded-[30px] border border-slate-200 shadow-sm">
          <ReportePreview
            data={reporteData}
            tipo={activeTab}
            onVerCompleto={verReporteCompleto}
          />

          {/* Botones de exportación */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <ExportButtons
              onExport={exportarReporte}
              onVerCompleto={verReporteCompleto}
              loading={loading}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportesPage;