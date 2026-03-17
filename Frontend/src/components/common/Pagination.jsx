import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button';
import Select from './Input';

// ============================================
// COMPONENTE PAGINATION
// Controles de paginación
// ============================================

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 30, 50, 100],
  totalItems,
  showPageNumbers = true,
  showFirstLast = true,
  showItemsPerPage = true,
  maxVisiblePages = 5,
  className = ''
}) => {
  // ========================================
  // FUNCIONES DE NAVEGACIÓN
  // ========================================
  const goToFirst = () => onPageChange(1);
  const goToLast = () => onPageChange(totalPages);
  const goToPrev = () => onPageChange(currentPage - 1);
  const goToNext = () => onPageChange(currentPage + 1);

  // ========================================
  // GENERAR NÚMEROS DE PÁGINA
  // ========================================
  const getPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      const left = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const right = Math.min(totalPages, left + maxVisiblePages - 1);
      
      if (left > 1) {
        pages.push(1);
        if (left > 2) pages.push('...');
      }
      
      for (let i = left; i <= right; i++) {
        pages.push(i);
      }
      
      if (right < totalPages) {
        if (right < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Items per page */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Mostrar</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">por página</span>
        </div>
      )}

      {/* Información de resultados */}
      {totalItems && (
        <div className="text-sm text-gray-700">
          Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
        </div>
      )}

      {/* Controles de paginación */}
      <div className="flex items-center space-x-2">
        {/* Primera página */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToFirst}
            disabled={currentPage === 1}
          >
            <ChevronsLeft size={16} />
          </Button>
        )}

        {/* Anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrev}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
          <span className="ml-1">Anterior</span>
        </Button>

        {/* Números de página */}
        {showPageNumbers && getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-gray-500">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          )
        ))}

        {/* Siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={currentPage === totalPages}
        >
          <span className="mr-1">Siguiente</span>
          <ChevronRight size={16} />
        </Button>

        {/* Última página */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToLast}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Pagination;