import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import ReporteQuincenal from '../components/ReporteQuincenal';
import ReporteEmpleado from '../components/ReporteEmpleado';
import ExportButtons from '../components/ExportButtons';
import { Button, Card } from '../../../components/common';
import { useUIStore } from '../../../store';

// ============================================
// PÁGINA DE REPORTE GENERADO (VISTA COMPLETA)
// ============================================

const ReporteGeneradoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  
  const { reporteData, parametros } = location.state || {};

  // ========================================
  // VALIDACIÓN
  // ========================================
  if (!reporteData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay datos de reporte para mostrar</p>
        <Button
          variant="primary"
          onClick={() => navigate('/reportes')}
          className="mt-4"
        >
          Volver a Reportes
        </Button>
      </div>
    );
  }

  // ========================================
  // HANDLERS
  // ========================================
  const handleExportar = (formato) => {
    showToast({
      type: 'success',
      message: `Exportando como ${formato.toUpperCase()}...`
    });
  };

  const handleImprimir = () => {
    window.print();
  };

  // ========================================
  // RENDER SEGÚN TIPO
  // ========================================
  const renderReporte = () => {
    switch (reporteData.tipo) {
      case 'QUINCENAL':
        return <ReporteQuincenal data={reporteData} fullPage />;
      case 'EMPLEADO':
        return <ReporteEmpleado data={reporteData} fullPage />;
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Tipo de reporte no soportado
          </div>
        );
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header - oculto al imprimir */}
      <div className="flex justify-between items-center print:hidden">
        <Button
          variant="ghost"
          onClick={() => navigate('/reportes')}
          icon={ArrowLeft}
        >
          Volver
        </Button>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleImprimir}
            icon={Printer}
          >
            Imprimir
          </Button>
          <ExportButtons
            onExport={handleExportar}
            onVerCompleto={() => {}}
            showVerCompleto={false}
          />
        </div>
      </div>

      {/* Información del reporte */}
      <Card className="print:shadow-none print:border-none">
        <div className="mb-6 print:mb-4">
          <h1 className="text-2xl font-bold text-gray-900 print:text-xl">
            {reporteData.titulo}
          </h1>
          <p className="text-gray-500 mt-1 print:text-sm">
            Generado el {new Date(reporteData.fechaGeneracion).toLocaleString()}
          </p>
          {parametros && (
            <div className="mt-2 text-sm text-gray-600 print:text-xs">
              <p>Período: {parametros.mes}/{parametros.anio}</p>
              {parametros.quincena && <p>Quincena: {parametros.quincena}</p>}
            </div>
          )}
        </div>

        {/* Contenido del reporte */}
        {renderReporte()}
      </Card>

      {/* Footer - oculto al imprimir */}
      <div className="text-center text-sm text-gray-400 print:hidden">
        <p>Hartemania Overtime System - Reporte generado automáticamente</p>
      </div>
    </div>
  );
};

export default ReporteGeneradoPage;