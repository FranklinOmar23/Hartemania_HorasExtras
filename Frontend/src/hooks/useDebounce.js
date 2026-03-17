import { useState, useEffect } from 'react';

// ============================================
// HOOK: useDebounce
// Retrasa la actualización de un valor para evitar operaciones frecuentes
// Útil para búsquedas en tiempo real, validaciones, etc.
// ============================================

/**
 * @param {any} value - Valor a debounce
 * @param {number} delay - Retraso en milisegundos (default: 500ms)
 * @returns {any} Valor con debounce
 */
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configurar timer
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timer si el valor cambia antes del delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// VARIANTES ESPECIALIZADAS
// ============================================

/**
 * Hook para debounce de funciones
 * @param {Function} fn - Función a ejecutar
 * @param {number} delay - Retraso en ms
 * @returns {Function} Función con debounce
 */
export function useDebounceFn(fn, delay = 500) {
  const [timer, setTimer] = useState(null);

  const debouncedFn = (...args) => {
    // Limpiar timer anterior
    if (timer) {
      clearTimeout(timer);
    }

    // Configurar nuevo timer
    const newTimer = setTimeout(() => {
      fn(...args);
    }, delay);

    setTimer(newTimer);
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  return debouncedFn;
}

/**
 * Hook para debounce de llamadas API
 */
export function useDebounceApi(apiCall, delay = 500) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const debouncedCall = useDebounceFn(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(...args);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, delay);

  return [debouncedCall, { data, loading, error }];
}

/**
 * Hook para búsqueda con debounce
 */
export function useDebounceSearch(searchFn, delay = 500) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(searchTerm, delay);

  useEffect(() => {
    if (!debouncedSearch) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchFn(debouncedSearch);
        setResults(data);
      } catch (err) {
        setError(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearch, searchFn]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error,
    debouncedSearch
  };
}

export default useDebounce;