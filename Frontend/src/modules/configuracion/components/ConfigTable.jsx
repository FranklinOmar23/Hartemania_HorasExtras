import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Table, Button, Badge } from '../../../components/common';

// ============================================
// COMPONENTE CONFIG TABLE
// Tabla genérica para configuraciones
// ============================================

const ConfigTable = ({
  columns,
  data,
  loading,
  onEditar,
  onEliminar,
  onVer,
  emptyMessage = 'No hay datos para mostrar',
  showActions = true
}) => {
  // Agregar columna de acciones si es necesario
  const tableColumns = showActions
    ? [
        ...columns,
        {
          key: 'acciones',
          label: '',
          render: (_, row) => (
            <div className="flex items-center space-x-2">
              {onVer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVer(row)}
                  icon={Eye}
                >
                  <span className="sr-only">Ver</span>
                </Button>
              )}
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
      ]
    : columns;

  return (
    <Table
      columns={tableColumns}
      data={data}
      loading={loading}
      emptyMessage={emptyMessage}
    />
  );
};

export default ConfigTable;