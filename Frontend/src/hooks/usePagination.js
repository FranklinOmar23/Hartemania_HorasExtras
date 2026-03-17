import { useState, useMemo, useCallback } from 'react';

// ============================================
// HOOK: usePagination
// Maneja la lógica de paginación para listas de datos
// ============================================

/**
 * @param {Array} data - Array de datos a paginar
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones de paginación
 */
function usePagination(data = [], options = {}) {
  const {
    initialPage = 1,
    initialPageSize = 20,
    pageSizeOptions = [10, 20, 30, 50, 100],
    serverSide = false,
    totalItems: propTotalItems = 0,
    onPageChange = null
  } = options;

  // Estados
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(
    serverSide ? propTotalItems : data.length
  );

  // Calcular valores de paginación
  const paginationValues = useMemo(() => {
    const total = serverSide ? totalItems : data.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);
    
    // Datos de la página actual
    const currentData = serverSide 
      ? data 
      : data.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      currentData,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages,
      from: total === 0 ? 0 : startIndex + 1,
      to: endIndex,
      total
    };
  }, [data, currentPage, pageSize, serverSide, totalItems]);

  // Cambiar a una página específica
  const goToPage = useCallback((page) => {
    const newPage = Math.max(1, Math.min(page, paginationValues.totalPages));
    setCurrentPage(newPage);
    
    if (onPageChange) {
      onPageChange(newPage, pageSize);
    }
  }, [paginationValues.totalPages, pageSize, onPageChange]);

  // Cambiar tamaño de página
  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset a primera página
    
    if (onPageChange) {
      onPageChange(1, newSize);
    }
  }, [onPageChange]);

  // Navegación
  const nextPage = useCallback(() => {
    if (paginationValues.hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, paginationValues.hasNextPage, goToPage]);

  const previousPage = useCallback(() => {
    if (paginationValues.hasPreviousPage) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, paginationValues.hasPreviousPage, goToPage]);

  const firstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const lastPage = useCallback(() => {
    goToPage(paginationValues.totalPages);
  }, [paginationValues.totalPages, goToPage]);

  // Generar array de números de página para mostrar
  const getPageNumbers = useCallback((maxVisible = 5) => {
    const { totalPages } = paginationValues;
    const pages = [];
    
    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      const left = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const right = Math.min(totalPages, left + maxVisible - 1);
      
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
  }, [currentPage, paginationValues]);

  // Actualizar totalItems cuando cambia en serverSide
  const updateTotalItems = useCallback((newTotal) => {
    if (serverSide) {
      setTotalItems(newTotal);
    }
  }, [serverSide]);

  return {
    // Estado
    currentPage,
    pageSize,
    pageSizeOptions,
    
    // Datos paginados
    data: paginationValues.currentData,
    
    // Metadatos
    totalPages: paginationValues.totalPages,
    totalItems: paginationValues.total,
    startIndex: paginationValues.startIndex,
    endIndex: paginationValues.endIndex,
    from: paginationValues.from,
    to: paginationValues.to,
    
    // Flags
    hasNextPage: paginationValues.hasNextPage,
    hasPreviousPage: paginationValues.hasPreviousPage,
    isFirstPage: paginationValues.isFirstPage,
    isLastPage: paginationValues.isLastPage,
    
    // Acciones
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    changePageSize,
    getPageNumbers,
    updateTotalItems
  };
}

// ============================================
// HOOK: useInfiniteScroll
// Para paginación infinita (scroll infinito)
// ============================================
export function useInfiniteScroll(fetchMore, options = {}) {
  const {
    threshold = 100,
    initialPage = 1,
    loading = false,
    hasMore = true
  } = options;

  const [page, setPage] = useState(initialPage);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMoreItems, setHasMoreItems] = useState(hasMore);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMoreItems) return;

    setIsLoading(true);
    setError(null);

    try {
      const newItems = await fetchMore(page);
      
      if (newItems.length === 0) {
        setHasMoreItems(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMoreItems, fetchMore]);

  // Detectar scroll near bottom
  const handleScroll = useCallback(() => {
    if (isLoading || !hasMoreItems) return;

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollHeight - scrollTop <= clientHeight + threshold) {
      loadMore();
    }
  }, [isLoading, hasMoreItems, loadMore, threshold]);

  // Agregar event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Reset
  const reset = useCallback(() => {
    setPage(initialPage);
    setItems([]);
    setIsLoading(false);
    setError(null);
    setHasMoreItems(true);
  }, [initialPage]);

  return {
    items,
    isLoading,
    error,
    hasMore: hasMoreItems,
    loadMore,
    reset
  };
}

// ============================================
// HOOK: useTablePagination
// Especializado para tablas
// ============================================
export function useTablePagination(data = [], options = {}) {
  const pagination = usePagination(data, options);
  
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});

  // Aplicar filtros y ordenamiento
  const processedData = useMemo(() => {
    let result = [...data];

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => 
          String(item[key]).toLowerCase().includes(String(value).toLowerCase())
        );
      }
    });

    // Aplicar ordenamiento
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return result;
  }, [data, filters, sortBy, sortDirection]);

  // Actualizar totalItems en paginación
  useEffect(() => {
    pagination.updateTotalItems(processedData.length);
  }, [processedData.length, pagination.updateTotalItems]);

  // Función para ordenar
  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  }, [sortBy]);

  // Función para filtrar
  const handleFilter = useCallback((column, value) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
    pagination.goToPage(1); // Reset a primera página
  }, [pagination]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
    pagination.goToPage(1);
  }, [pagination]);

  return {
    ...pagination,
    data: pagination.serverSide ? pagination.data : pagination.data, // Ya viene filtrado
    sortBy,
    sortDirection,
    filters,
    handleSort,
    handleFilter,
    clearFilters
  };
}

export default usePagination;