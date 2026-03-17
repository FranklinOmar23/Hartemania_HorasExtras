// ============================================
// src/modules/calculos/index.js
// ============================================

// Primero importamos todos los componentes
import CalculosPage from './pages/CalculosPage';
import CalculoDetallePage from './pages/CalculoDetallePage';
import CalculoForm from './components/CalculoForm';
import CalculoResumen from './components/CalculoResumen';
import CalculoEmpleadoTable from './components/CalculoEmpleadoTable';
import CalculoConfigPanel from './components/CalculoConfigPanel';
import useCalculos from './hooks/useCalculos';

// Exportaciones nombradas
export { 
  CalculosPage,
  CalculoDetallePage,
  CalculoForm,
  CalculoResumen,
  CalculoEmpleadoTable,
  CalculoConfigPanel,
  useCalculos
};

// Exportación por defecto
export default {
  CalculosPage,
  CalculoDetallePage,
  CalculoForm,
  CalculoResumen,
  CalculoEmpleadoTable,
  CalculoConfigPanel,
  useCalculos
};