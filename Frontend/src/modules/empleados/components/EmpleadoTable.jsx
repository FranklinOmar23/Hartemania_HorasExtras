import React from 'react';
import { Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { Table, Badge, Button, Pagination } from '../../../components/common';
import { formatearMoneda, formatearFecha } from '../../../utils';

// ============================================
// COMPONENTE EMPLEADO TABLE
// Tabla de empleados con acciones
// ============================================

const EmpleadoTable = ({
  empleados = [],
  loading,
  onEditar,
  onEliminar,
  onVerDetalle,
  selectedEmpleados = [],
  onSelectionChange,
  paginacion,
  onPageChange
}) => {
  // ========================================
  // COLUMNAS DE LA TABLA
  // ========================================
  const columns = [
    {
      key: 'codigo',
      label: 'Código',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm font-medium text-gray-900">
          {value}
        </span>
      )
    },
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.nombre} {row.apellido}
          </p>
          <p className="text-xs text-gray-500">{row.posicion}</p>
        </div>
      )
    },
    {
      key: 'departamento',
      label: 'Departamento',
      render: (value) => value || '—'
    },
    {
      key: 'salarioBase',
      label: 'Salario Base',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">
          {formatearMoneda(value)}
        </span>
      )
    },
    {
      key: 'fechaIngreso',
      label: 'Ingreso',
      render: (value) => formatearFecha(value)
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (value) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    {
      key: 'acciones',
      label: '',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVerDetalle(row.id)}
            icon={Eye}
          >
            <span className="sr-only">Ver</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditar(row.id)}
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
  // HANDLERS DE SELECCIÓN
  // ========================================
  const handleSelectAll = (selected) => {
    if (selected) {
      onSelectionChange(empleados.map(e => e.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id, selected) => {
    if (selected) {
      onSelectionChange([...selectedEmpleados, id]);
    } else {
      onSelectionChange(selectedEmpleados.filter(i => i !== id));
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={empleados}
        loading={loading}
        selectable
        selectedRows={selectedEmpleados}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        emptyMessage="No hay empleados para mostrar"
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

export default EmpleadoTable;