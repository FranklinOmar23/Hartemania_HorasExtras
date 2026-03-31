import React, { useState, useEffect } from 'react';
import { Eye, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { Table, Badge, Button, Input, Pagination } from '../../../components/common';
import { formatearMoneda, formatearHoras } from '../../../utils';

// ============================================
// COMPONENTE CALCULO EMPLEADO TABLE
// Tabla de empleados con resultados de horas extras
// ============================================

const CalculoEmpleadoTable = ({ 
  empleados = [], 
  loading = false, 
  onVerDetalle,
  paginacion: externalPagination,
  onPageChange,
  onPageSizeChange 
}) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });
  
  // Paginación local (si no se proporciona externamente)
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [localItemsPerPage, setLocalItemsPerPage] = useState(20);

  // Usar paginación externa o local
  const currentPage = externalPagination?.currentPage || localCurrentPage;
  const itemsPerPage = externalPagination?.pageSize || localItemsPerPage;
  const totalItems = externalPagination?.totalItems || empleados.length;
  const totalPages = externalPagination?.totalPages || Math.ceil(empleados.length / itemsPerPage);

  // ========================================
  // FILTRADO Y ORDENAMIENTO
  // ========================================
  
  // Aplicar filtro de búsqueda
  const filteredEmpleados = empleados.filter(emp => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (emp.nombre?.toLowerCase() || '').includes(searchLower) ||
      (emp.codigo?.toLowerCase() || '').includes(searchLower) ||
      (emp.id?.toString() || '').includes(searchLower)
    );
  });

  // Aplicar ordenamiento
  const sortedEmpleados = [...filteredEmpleados].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;
    
    const comparison = aVal > bVal ? 1 : -1;
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  // ========================================
  // PAGINACIÓN
  // ========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmpleados = sortedEmpleados.slice(indexOfFirstItem, indexOfLastItem);
  const filteredTotalPages = Math.ceil(sortedEmpleados.length / itemsPerPage);

  // ========================================
  // HANDLERS
  // ========================================
  const handlePageChange = (page) => {
    if (externalPagination && onPageChange) {
      onPageChange(page);
    } else {
      setLocalCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (newSize) => {
    if (externalPagination && onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setLocalItemsPerPage(newSize);
      setLocalCurrentPage(1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    handlePageChange(1); // Reset a primera página al buscar
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // ========================================
  // COLUMNAS DE LA TABLA
  // ========================================
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} className="ml-1 inline" />
      : <ChevronDown size={14} className="ml-1 inline" />;
  };

  const columns = [
    {
      key: 'codigo',
      label: (
        <button 
          onClick={() => handleSort('codigo')}
          className="flex items-center hover:text-blue-600"
        >
          Código {getSortIcon('codigo')}
        </button>
      ),
      render: (value) => (
        <span className="font-mono text-sm font-medium text-gray-900">
          {value || '—'}
        </span>
      )
    },
    {
      key: 'nombre',
      label: (
        <button 
          onClick={() => handleSort('nombre')}
          className="flex items-center hover:text-blue-600"
        >
          Empleado {getSortIcon('nombre')}
        </button>
      ),
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value || 'Sin nombre'}</p>
          <p className="text-xs text-gray-500">{row.codigo || '—'}</p>
        </div>
      )
    },
    {
      key: 'horas35',
      label: (
        <button 
          onClick={() => handleSort('horas35')}
          className="flex items-center hover:text-blue-600"
        >
          HE 35% {getSortIcon('horas35')}
        </button>
      ),
      render: (value, row) => (
        <div>
          <span className="font-medium text-blue-600">
            {formatearHoras(value || 0)}
          </span>
          <span className="text-xs text-gray-500 ml-1">hrs</span>
          <br />
          <span className="text-xs font-medium text-green-600">
            {formatearMoneda(row.monto35 || 0)}
          </span>
        </div>
      )
    },
    {
      key: 'horas100',
      label: (
        <button 
          onClick={() => handleSort('horas100')}
          className="flex items-center hover:text-blue-600"
        >
          HE 100% {getSortIcon('horas100')}
        </button>
      ),
      render: (value, row) => (
        <div>
          <span className="font-medium text-green-600">
            {formatearHoras(value || 0)}
          </span>
          <span className="text-xs text-gray-500 ml-1">hrs</span>
          <br />
          <span className="text-xs font-medium text-green-600">
            {formatearMoneda(row.monto100 || 0)}
          </span>
        </div>
      )
    },
    {
      key: 'horas15',
      label: (
        <button 
          onClick={() => handleSort('horas15')}
          className="flex items-center hover:text-blue-600"
        >
          HE 15% {getSortIcon('horas15')}
        </button>
      ),
      render: (value, row) => (
        <div>
          <span className="font-medium text-yellow-600">
            {formatearHoras(value || 0)}
          </span>
          <span className="text-xs text-gray-500 ml-1">hrs</span>
          <br />
          <span className="text-xs font-medium text-green-600">
            {formatearMoneda(row.monto15 || 0)}
          </span>
        </div>
      )
    },
    {
      key: 'horasFeriado',
      label: (
        <button 
          onClick={() => handleSort('horasFeriado')}
          className="flex items-center hover:text-blue-600"
        >
          Feriado {getSortIcon('horasFeriado')}
        </button>
      ),
      render: (value, row) => (
        <div>
          <span className="font-medium text-red-600">
            {formatearHoras(value || 0)}
          </span>
          <span className="text-xs text-gray-500 ml-1">hrs</span>
          <br />
          <span className="text-xs font-medium text-green-600">
            {formatearMoneda(row.montoFeriado || 0)}
          </span>
        </div>
      )
    },
    {
      key: 'totalPagar',
      label: (
        <button 
          onClick={() => handleSort('totalPagar')}
          className="flex items-center hover:text-blue-600"
        >
          Total a Pagar {getSortIcon('totalPagar')}
        </button>
      ),
      render: (value) => (
        <span className="font-bold text-green-600">
          {formatearMoneda(value || 0)}
        </span>
      )
    },
    {
      key: 'acciones',
      label: '',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={() => onVerDetalle?.(row)}
          className="hover:bg-blue-50 hover:text-blue-600"
          title="Ver detalle del empleado"
        >
          Ver
        </Button>
      )
    }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y totales */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={handleSearchChange}
            icon={Search}
          />
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-500">
            Total: <span className="font-semibold text-gray-900">{filteredEmpleados.length}</span> empleados
          </span>
          {filteredEmpleados.length !== empleados.length && (
            <span className="text-blue-600">
              (filtrados de {empleados.length})
            </span>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-2 shadow-sm">
      <Table
        columns={columns}
        data={currentEmpleados}
        loading={loading}
        emptyMessage="No hay empleados con horas extras en este período"
        onRowClick={onVerDetalle}
      />
      </div>

      {/* Paginación */}
      {filteredEmpleados.length > 0 && (
        <div className="space-y-3">
          <Pagination
            currentPage={currentPage}
            totalPages={filteredTotalPages}
            onPageChange={handlePageChange}
            totalItems={filteredEmpleados.length}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={[10, 20, 30, 50, 100]}
            showFirstLast
            showItemsPerPage
          />
          
          {/* Información de paginación */}
          <div className="text-sm text-gray-500 text-center">
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredEmpleados.length)} de {filteredEmpleados.length} empleados
            {filteredEmpleados.length < empleados.length && (
              <span> (filtrados de {empleados.length} totales)</span>
            )}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay resultados de búsqueda */}
      {filteredEmpleados.length === 0 && empleados.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron empleados que coincidan con "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default CalculoEmpleadoTable;