// ============================================
// src/modules/empleados/index.js
// ============================================

// Primero importamos todos los componentes
import EmpleadosPage from './pages/EmpleadosPage';
import EmpleadoFormPage from './pages/EmpleadoFormPage';
import EmpleadoDetallePage from './pages/EmpleadoDetallePage';
import EmpleadoTable from './components/EmpleadoTable';
import EmpleadoForm from './components/EmpleadoForm';
import EmpleadoFilter from './components/EmpleadoFilter';
import EmpleadoCard from './components/EmpleadoCard';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import useEmpleados from './hooks/useEmpleados';
import useEmpleadoForm from './hooks/useEmpleadoForm';

// Exportaciones nombradas
export { 
  EmpleadosPage,
  EmpleadoFormPage,
  EmpleadoDetallePage,
  EmpleadoTable,
  EmpleadoForm,
  EmpleadoFilter,
  EmpleadoCard,
  DeleteConfirmModal,
  useEmpleados,
  useEmpleadoForm
};

// Exportación por defecto
export default {
  EmpleadosPage,
  EmpleadoFormPage,
  EmpleadoDetallePage,
  EmpleadoTable,
  EmpleadoForm,
  EmpleadoFilter,
  EmpleadoCard,
  DeleteConfirmModal,
  useEmpleados,
  useEmpleadoForm
};