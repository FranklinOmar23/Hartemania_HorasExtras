import { useState, useEffect } from 'react';

// ============================================
// HOOK: useLocalStorage
// Maneja el almacenamiento en localStorage con estado sincronizado
// ============================================

/**
 * @param {string} key - Clave en localStorage
 * @param {any} initialValue - Valor inicial si no existe
 * @returns {Array} [valor, setValor, remover]
 */
function useLocalStorage(key, initialValue) {
  // Estado para almacenar el valor
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Obtener del localStorage
      const item = window.localStorage.getItem(key);
      // Parsear JSON o retornar valor inicial
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error leyendo localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Función para actualizar el valor
  const setValue = (value) => {
    try {
      // Permitir valor como función
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Actualizar estado
      setStoredValue(valueToStore);
      
      // Guardar en localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error guardando localStorage key "${key}":`, error);
    }
  };

  // Función para remover del localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removiendo localStorage key "${key}":`, error);
    }
  };

  // Escuchar cambios en localStorage desde otras pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// ============================================
// VARIANTES ESPECIALIZADAS
// ============================================

/**
 * Hook para guardar objetos con merge automático
 */
export function useLocalStorageObject(key, initialValue = {}) {
  const [storedValue, setStoredValue] = useLocalStorage(key, initialValue);

  const mergeValue = (newValue) => {
    setStoredValue(prev => ({
      ...prev,
      ...(newValue instanceof Function ? newValue(prev) : newValue)
    }));
  };

  return [storedValue, mergeValue, setStoredValue];
}

/**
 * Hook para guardar arrays
 */
export function useLocalStorageArray(key, initialValue = []) {
  const [storedValue, setStoredValue] = useLocalStorage(key, initialValue);

  const push = (item) => {
    setStoredValue(prev => [...prev, item]);
  };

  const remove = (indexOrPredicate) => {
    setStoredValue(prev => {
      if (typeof indexOrPredicate === 'function') {
        return prev.filter((item, i) => !indexOrPredicate(item, i));
      }
      return prev.filter((_, i) => i !== indexOrPredicate);
    });
  };

  const update = (index, newValue) => {
    setStoredValue(prev => {
      const copy = [...prev];
      copy[index] = newValue instanceof Function ? newValue(copy[index]) : newValue;
      return copy;
    });
  };

  const clear = () => {
    setStoredValue([]);
  };

  return [storedValue, { push, remove, update, clear, set: setStoredValue }];
}

/**
 * Hook para preferencias del usuario
 */
export function usePreferences(defaultPreferences = {}) {
  return useLocalStorageObject('user-preferences', {
    theme: 'light',
    itemsPerPage: 20,
    notifications: true,
    ...defaultPreferences
  });
}

/**
 * Hook para historial de búsquedas
 */
export function useSearchHistory(maxItems = 10) {
  const [history, setHistory] = useLocalStorageArray('search-history', []);

  const addSearch = (term) => {
    if (!term.trim()) return;
    
    setHistory(prev => {
      // Remover si ya existe
      const filtered = prev.filter(item => item !== term);
      // Agregar al inicio y limitar
      return [term, ...filtered].slice(0, maxItems);
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return [history, addSearch, clearHistory];
}

export default useLocalStorage;