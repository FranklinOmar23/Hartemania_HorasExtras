import React from 'react';
import { Edit, Trash2, Eye, Clock, Upload, User } from 'lucide-react';
import { Table, Badge, Button, Pagination } from '../../../components/common';
import { formatearFecha, formatearHora, formatearHoras } from '../../../utils';

// ============================================
// COMPONENTE REGISTROS TABLE
// Tabla de registros de asistencia
// ============================================

const RegistrosTable = ({
  registros = [],
  loading,
  onVerDetalle,
  onEditar,
  onEliminar,
  paginacion,
  onPageChange
}) => {
  // ========================================
  // COLUMNAS DE LA TABLA
  // ========================================
  const columns = [
    {
      key: 'fecha',
      label: 'Fecha',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">
          {formatearFecha(value)}
        </span>
      )
    },
    {
      key: 'empleado',
      label: 'Empleado',
      render: (_, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
            <User size={14} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {row.empleadoNombre}
            </p>
            <p className="text-xs text-gray-500">
              {row.codigoEmpleado}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'horas',
      label: 'Horas',
      render: (_, row) => (
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <span className="text-gray-500 w-16">Entrada:</span>
            <span className="font-mono">{formatearHora(row.horaEntrada) || '—'}</span>
          </div>
          <div className="flex items-center text-xs">
            <span className="text-gray-500 w-16">Salida:</span>
            <span className="font-mono">{formatearHora(row.horaSalida) || '—'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'he35',
      label: 'HE 35%',
      render: (value) => value ? (
        <Badge variant="primary" size="sm">
          {formatearHoras(value)}
        </Badge>
      ) : '—'
    },
    {
      key: 'he100',
      label: 'HE 100%',
      render: (value) => value ? (
        <Badge variant="success" size="sm">
          {formatearHoras(value)}
        </Badge>
      ) : '—'
    },
    {
      key: 'he15',
      label: 'HE 15%',
      render: (value) => value ? (
        <Badge variant="warning" size="sm">
          {formatearHoras(value)}
        </Badge>
      ) : '—'
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (value) => {
        const config = {
          IMPORTADO: { label: 'Importado', icon: Upload, variant: 'info' },
          MANUAL: { label: 'Manual', icon: Clock, variant: 'primary' },
          RELOJ: { label: 'Reloj', icon: Clock, variant: 'success' }
        };
        const tipo = config[value] || config.IMPORTADO;
        return (
          <Badge variant={tipo.variant} size="sm" icon={tipo.icon}>
            {tipo.label}
          </Badge>
        );
      }
    },
    {
      key: 'acciones',
      label: '',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVerDetalle(row)}
            icon={Eye}
          >
            <span className="sr-only">Ver</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditar(row)}
            icon={Edit}
          >
            <span className="sr-only">Editar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEliminar(row)}
            icon={Trash2}
            className="text-red-600 hover:text-red-800"
          >
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
      )
    }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={registros}
        loading={loading}
        emptyMessage="No hay registros para mostrar"
        onRowClick={onVerDetalle}
      />

      {paginacion && (
        <Pagination
          currentPage={paginacion.currentPage}
          totalPages={paginacion.totalPages}
          onPageChange={onPageChange}
          totalItems={paginacion.totalItems}
          itemsPerPage={paginacion.pageSize}
          onItemsPerPageChange={paginacion.onPageSizeChange}
        />
      )}
    </div>
  );
};

export default RegistrosTable;