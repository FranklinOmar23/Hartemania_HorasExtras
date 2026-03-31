import React from 'react';
import { Maximize2 } from 'lucide-react';
import ReporteQuincenal from './ReporteQuincenal';
import ReporteEmpleado from './ReporteEmpleado';
import { Button } from '../../../components/common';
import { formatearMoneda } from '../../../utils';

// ============================================
// COMPONENTE REPORTE PREVIEW
// Vista previa del reporte generado
// ============================================

const ReportePreview = ({ data, tipo, onVerCompleto }) => {
  // ========================================
  // RENDER SEGÚN TIPO
  // ========================================
  const renderPreview = () => {
    switch (tipo) {
      case 'quincenal':
        return <ReporteQuincenal data={data} />;
      case 'empleado':
        return <ReporteEmpleado data={data} />;
      case 'comparativo':
        return <ReporteComparativoPreview data={data} />;
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Vista previa no disponible para este tipo de reporte
          </div>
        );
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="relative rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      {/* Overlay gradient para indicar que hay más contenido */}
      <div className="pointer-events-none absolute bottom-0 left-4 right-4 h-24 bg-gradient-to-t from-white via-white/90 to-transparent" />
      
      {/* Contenido del preview */}
      <div className="max-h-[34rem] overflow-y-auto pb-10">
        {renderPreview()}
      </div>

      {/* Botón para ver completo */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform">
        <Button
          variant="outline"
          size="sm"
          onClick={onVerCompleto}
          icon={Maximize2}
          className="bg-white shadow-lg hover:bg-gray-50"
        >
          Ver reporte completo
        </Button>
      </div>
    </div>
  );
};

// ============================================
// PREVIEW PARA REPORTE COMPARATIVO
// ============================================
const ReporteComparativoPreview = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.datos.slice(0, 4).map((item, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-gray-700">{item.mes}</p>
            <p className="text-lg font-semibold text-blue-600">{item.horas} hrs</p>
            <p className="text-xs text-gray-500">{formatearMoneda(item.monto)}</p>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-400 text-center pt-2">
        Vista previa parcial. Genere el reporte completo para ver todos los datos.
      </p>
    </div>
  );
};

export default ReportePreview;