// ============================================
// src/modules/registros/index.js
// ============================================

// Primero importamos todos los componentes
import RegistrosPage from './pages/RegistrosPage';
import RegistroManualPage from './pages/RegistroManualPage';
import RegistrosTable from './components/RegistrosTable';
import RegistroManualForm from './components/RegistroManualForm';
import RegistroFilter from './components/RegistroFilter';
import RegistroCalendario from './components/RegistroCalendario';
import RegistroDetalleModal from './components/RegistroDetalleModal';
import useRegistros from './hooks/useRegistros';
import useRegistroForm from './hooks/useRegistroForm';

// Exportaciones nombradas
export { 
  RegistrosPage,
  RegistroManualPage,
  RegistrosTable,
  RegistroManualForm,
  RegistroFilter,
  RegistroCalendario,
  RegistroDetalleModal,
  useRegistros,
  useRegistroForm
};

// Exportación por defecto
export default {
  RegistrosPage,
  RegistroManualPage,
  RegistrosTable,
  RegistroManualForm,
  RegistroFilter,
  RegistroCalendario,
  RegistroDetalleModal,
  useRegistros,
  useRegistroForm
};