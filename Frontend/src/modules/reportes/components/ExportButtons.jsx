import React from 'react';
import { Download, FileText, Table, FileSpreadsheet, Maximize2 } from 'lucide-react';
import { Button } from '../../../components/common';

// ============================================
// COMPONENTE EXPORT BUTTONS
// Botones para exportar reportes
// ============================================

const ExportButtons = ({ onExport, onVerCompleto, loading = false, showVerCompleto = true }) => {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {showVerCompleto && (
        <Button
          variant="outline"
          onClick={onVerCompleto}
          icon={Maximize2}
          disabled={loading}
        >
          Ver completo
        </Button>
      )}

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport('excel')}
          loading={loading}
          icon={Table}
          title="Exportar a Excel"
        >
          Excel
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport('pdf')}
          loading={loading}
          icon={FileText}
          title="Exportar a PDF"
        >
          PDF
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport('csv')}
          loading={loading}
          icon={FileSpreadsheet}
          title="Exportar a CSV"
        >
          CSV
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onExport('excel')}
          loading={loading}
          icon={Download}
        >
          Descargar
        </Button>
      </div>
    </div>
  );
};

export default ExportButtons;