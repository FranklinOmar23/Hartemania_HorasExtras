// ============================================
// ARCHIVO DE EXPORTACIÓN DE STORES
// ============================================

import useEmpleadosStore from './empleadosStore';
import useUIStore from './uiStore';

// Exportaciones nombradas
export { useEmpleadosStore, useUIStore };

// Exportación por defecto con todos los stores
export default {
  empleados: useEmpleadosStore,
  ui: useUIStore
};

// ============================================
// SELECTORES PREDEFINIDOS PARA UI
// ============================================
export const uiSelectors = {
  theme: (state) => state.theme,
  sidebarOpen: (state) => state.sidebarOpen,
  toasts: (state) => state.toasts,
  showToast: (state) => state.showToast,
  removeToast: (state) => state.removeToast,
  openConfirmModal: (state) => state.openConfirmModal,
  closeConfirmModal: (state) => state.closeConfirmModal,
  setLoadingGlobal: (state) => state.setLoadingGlobal,
  setComponentLoading: (state) => state.setComponentLoading
};

// ============================================
// SELECTORES PREDEFINIDOS PARA EMPLEADOS
// ============================================
export const empleadosSelectors = {
  empleados: (state) => state.empleados,
  empleadoActual: (state) => state.empleadoActual,
  loading: (state) => state.loading,
  error: (state) => state.error,
  filtros: (state) => state.filtros,
  seleccionados: (state) => state.seleccionados,
  fetchEmpleados: (state) => state.fetchEmpleados,
  fetchEmpleadoById: (state) => state.fetchEmpleadoById,
  crearEmpleado: (state) => state.crearEmpleado,
  actualizarEmpleado: (state) => state.actualizarEmpleado,
  eliminarEmpleado: (state) => state.eliminarEmpleado
};