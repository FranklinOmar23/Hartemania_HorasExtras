import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// HOOK: useFetch
// Maneja peticiones fetch con estados de carga y error
// ============================================

/**
 * @param {string} url - URL a fetch
 * @param {Object} options - Opciones de fetch (method, headers, body, etc)
 * @param {boolean} executeOnMount - Si debe ejecutarse al montar el componente
 * @returns {Object} { data, loading, error, refetch, abort }
 */
function useFetch(url, options = {}, executeOnMount = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(executeOnMount);
  const [error, setError] = useState(null);
  
  // Usar useRef para mantener el abort controller
  const abortControllerRef = useRef(null);

  // Función para abortar la petición
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Función para ejecutar la petición
  const execute = useCallback(async (executeUrl = url, executeOptions = options) => {
    // Abortar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(executeUrl, {
        signal: abortControllerRef.current.signal,
        ...executeOptions,
        headers: {
          'Content-Type': 'application/json',
          ...executeOptions.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return { success: true, data: result };
    } catch (err) {
      // No mostrar error si fue abortado
      if (err.name === 'AbortError') {
        return { success: false, aborted: true };
      }
      
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  // Ejecutar al montar si está habilitado
  useEffect(() => {
    if (executeOnMount) {
      execute();
    }

    // Limpiar al desmontar
    return () => {
      abort();
    };
  }, [execute, executeOnMount, abort]);

  return {
    data,
    loading,
    error,
    refetch: execute,
    abort
  };
}

// ============================================
// VARIANTES ESPECIALIZADAS
// ============================================

/**
 * Hook para GET requests
 */
export function useGet(url, options = {}, executeOnMount = true) {
  return useFetch(url, { method: 'GET', ...options }, executeOnMount);
}

/**
 * Hook para POST requests
 */
export function usePost(url, options = {}) {
  const [postData, setPostData] = useState(null);
  
  const { data, loading, error, refetch } = useFetch(url, {
    method: 'POST',
    ...options
  }, false);

  const execute = useCallback(async (body) => {
    setPostData(body);
    return refetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options
    });
  }, [refetch, url, options]);

  return {
    data,
    loading,
    error,
    execute,
    postData
  };
}

/**
 * Hook para PUT requests
 */
export function usePut(url, options = {}) {
  const { data, loading, error, refetch } = useFetch(url, {
    method: 'PUT',
    ...options
  }, false);

  const execute = useCallback(async (id, body) => {
    return refetch(`${url}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options
    });
  }, [refetch, url, options]);

  return {
    data,
    loading,
    error,
    execute
  };
}

/**
 * Hook para DELETE requests
 */
export function useDelete(url, options = {}) {
  const { data, loading, error, refetch } = useFetch(url, {
    method: 'DELETE',
    ...options
  }, false);

  const execute = useCallback(async (id) => {
    return refetch(`${url}/${id}`, {
      method: 'DELETE',
      ...options
    });
  }, [refetch, url, options]);

  return {
    data,
    loading,
    error,
    execute
  };
}

/**
 * Hook para fetch con caché
 */
export function useFetchWithCache(url, options = {}, ttl = 60000) { // ttl: 60 segundos default
  const [cache, setCache] = useState(new Map());
  const fetchResult = useFetch(url, options, false);

  const executeWithCache = useCallback(async () => {
    const cached = cache.get(url);
    const now = Date.now();

    // Si hay caché válido, usarlo
    if (cached && (now - cached.timestamp) < ttl) {
      setFetchResult({
        data: cached.data,
        loading: false,
        error: null
      });
      return cached.data;
    }

    // Si no, hacer fetch
    const result = await fetchResult.refetch();
    
    if (result.success) {
      setCache(prev => new Map(prev).set(url, {
        data: result.data,
        timestamp: now
      }));
    }

    return result;
  }, [url, cache, fetchResult, ttl]);

  return {
    ...fetchResult,
    refetch: executeWithCache,
    clearCache: () => {
      setCache(new Map());
      const keyToDelete = Array.from(cache.keys()).find(k => k === url);
      if (keyToDelete) {
        setCache(prev => {
          const newCache = new Map(prev);
          newCache.delete(keyToDelete);
          return newCache;
        });
      }
    }
  };
}

export default useFetch;