import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Table, Badge } from '../../../components/common';
import { formatearFecha, formatearHora } from '../../../utils';

// ============================================
// COMPONENTE PREVIEW TABLE
// Tabla de vista previa de datos importados
// ============================================

const PreviewTable = ({ data, fileName }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  if (!data || !data.registros || data.registros.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos para mostrar
      </div>
    );
  }

  // ========================================
  // COLUMNAS DE LA TABLA
  // ========================================
  const columns = [
    {
      key: 'fila',
      label: 'Fila',
      width: '70px',
      render: (value) => (
        <span className="text-xs text-gray-500">#{value}</span>
      )
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value) => value ? formatearFecha(value) : '—'
    },
    {
      key: 'codigo',
      label: 'Código',
      render: (value) => (
        <span className="font-mono text-sm">{value || '—'}</span>
      )
    },
    {
      key: 'nombre',
      label: 'Nombre',
      render: (value) => value || '—'
    },
    {
      key: 'horaEntrada',
      label: 'Entrada',
      render: (value) => value && value !== '--' ? formatearHora(value) : '—'
    },
    {
      key: 'horaSalida',
      label: 'Salida',
      render: (value) => value && value !== '--' ? formatearHora(value) : '—'
    },
    {
      key: 'valido',
      label: 'Estado',
      render: (value, row) => {
        const tieneEntrada = row.horaEntrada && row.horaEntrada !== '--';
        const tieneSalida = row.horaSalida && row.horaSalida !== '--';
        
        if (tieneEntrada && tieneSalida) {
          return (
            <Badge variant="success" size="sm" icon={CheckCircle}>
              Completo
            </Badge>
          );
        } else if (!tieneEntrada && !tieneSalida) {
          return (
            <Badge variant="warning" size="sm" icon={AlertCircle}>
              Sin marcaciones
            </Badge>
          );
        } else {
          return (
            <Badge variant="warning" size="sm" icon={AlertCircle}>
              Incompleto
            </Badge>
          );
        }
      }
    }
  ];

  // ========================================
  // PAGINACIÓN
  // ========================================
  const totalPages = Math.ceil(data.registros.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.registros.slice(startIndex, startIndex + itemsPerPage);

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-4">
      {/* Información del archivo */}
      <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-900">{fileName}</p>
          <p className="text-xs text-gray-500 mt-1">
            {data.registros.length} registros encontrados
          </p>
        </div>
        <div className="text-xs text-gray-500">
          {data.columnas?.length || 0} columnas detectadas
        </div>
      </div>

      {/* Tabla de preview */}
      <Table
        columns={columns}
        data={currentData}
        emptyMessage="No hay registros para mostrar"
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, data.registros.length)} de {data.registros.length} registros
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex items-center space-x-4 text-xs text-gray-500 pt-2 border-t">
        <div className="flex items-center">
          <CheckCircle size={14} className="text-green-500 mr-1" />
          <span>Registro completo</span>
        </div>
        <div className="flex items-center">
          <AlertCircle size={14} className="text-yellow-500 mr-1" />
          <span>Registro incompleto</span>
        </div>
      </div>
    </div>
  );
};

export default PreviewTable;