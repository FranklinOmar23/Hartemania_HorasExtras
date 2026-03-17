import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Spinner from './Spinner';
import Pagination from './Pagination';

// ============================================
// COMPONENTE TABLE
// Tabla reutilizable con ordenamiento y selección
// ============================================

const Table = ({
  columns = [],
  data = [],
  loading = false,
  selectable = false,
  onSelectionChange,
  sortable = true,
  initialSortColumn,
  initialSortDirection = 'asc',
  onSort,
  emptyMessage = 'No hay datos para mostrar',
  className = '',
  rowClassName,
  onRowClick,
  pagination = false,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 30, 50, 100]
}) => {
  const [sortColumn, setSortColumn] = useState(initialSortColumn);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // ========================================
  // ORDENAMIENTO
  // ========================================
  const handleSort = (column) => {
    if (!sortable || !column.sortable) return;

    let newDirection = 'asc';
    if (sortColumn === column.key) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    setSortColumn(column.key);
    setSortDirection(newDirection);

    if (onSort) {
      onSort(column.key, newDirection);
    }
  };

  const getSortIcon = (column) => {
    if (!sortable || !column.sortable) return null;
    
    if (sortColumn === column.key) {
      return sortDirection === 'asc' 
        ? <ChevronUp size={16} className="ml-1" />
        : <ChevronDown size={16} className="ml-1" />;
    }
    
    return <ChevronsUpDown size={16} className="ml-1 text-gray-400" />;
  };

  // ========================================
  // SELECCIÓN
  // ========================================
  const toggleRow = (row) => {
    const newSelected = new Set(selectedRows);
    const rowId = row.id || JSON.stringify(row);

    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }

    setSelectedRows(newSelected);
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelected));
    }
  };

  const toggleAll = () => {
    let newSelected = new Set();
    
    if (selectedRows.size !== data.length) {
      newSelected = new Set(data.map(row => row.id || JSON.stringify(row)));
    }

    setSelectedRows(newSelected);
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelected));
    }
  };

  const isAllSelected = data.length > 0 && selectedRows.size === data.length;

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
          {/* HEADER */}
          <thead className="bg-gray-50">
            <tr>
              {/* Checkbox de selección */}
              {selectable && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}

              {/* Columnas */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.className || ''}`}
                  onClick={() => handleSort(column)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center">
                    {column.label}
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-20 text-center">
                  <Spinner size="lg" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-10 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const rowId = row.id || JSON.stringify(row);
                const isSelected = selectedRows.has(rowId);

                return (
                  <tr
                    key={rowId}
                    className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${rowClassName?.(row, rowIndex) || ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {/* Checkbox de fila */}
                    {selectable && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(row)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}

                    {/* Celdas */}
                    {columns.map((column) => (
                      <td
                        key={`${rowId}-${column.key}`}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.cellClassName || ''}`}
                      >
                        {column.render
                          ? column.render(row[column.key], row, rowIndex)
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}
            itemsPerPageOptions={itemsPerPageOptions}
          />
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTES AUXILIARES
// ============================================

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
    {children}
  </td>
);

export const TableHeader = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export default Table;