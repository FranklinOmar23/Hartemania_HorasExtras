// ============================================
// ARCHIVO DE EXPORTACIÓN DE HOOKS
// ============================================

// Hooks básicos
export { default as useLocalStorage } from './useLocalStorage';
export { default as useDebounce } from './useDebounce';
export { default as useFetch } from './useFetch';
export { default as usePagination } from './usePagination';

// ============================================
// EXPORTACIONES NOMBRADAS
// ============================================

// useLocalStorage
export * from './useLocalStorage';

// useDebounce
export * from './useDebounce';

// useFetch
export * from './useFetch';

// usePagination
export * from './usePagination';


// ============================================
// HOOKS PERSONALIZADOS ADICIONALES
// ============================================

/**
 * Hook para manejar el tema (claro/oscuro)
 */
export { default as useTheme } from './useTheme';

/**
 * Hook para manejar el estado del sidebar
 */
export { default as useSidebar } from './useSidebar';

/**
 * Hook para manejar formularios con validación
 */
export { default as useForm } from './useForm';

/**
 * Hook para manejar media queries
 */
export { default as useMediaQuery } from './useMediaQuery';

/**
 * Hook para manejar el click fuera de un elemento
 */
export { default as useClickOutside } from './useClickOutside';

/**
 * Hook para manejar el estado de la red
 */
export { default as useNetworkStatus } from './useNetworkStatus';

// ============================================
// EXPORTACIÓN POR DEFECTO
// ============================================
import * as Hooks from './index';
export default Hooks;