// ============================================
// src/modules/reportes/index.js
// ============================================

// Primero importamos todos los componentes
import ReportesPage from './pages/ReportesPage';
import ReporteGeneradoPage from './pages/ReporteGeneradoPage';
import ReporteSelector from './components/ReporteSelector';
import ReporteQuincenal from './components/ReporteQuincenal';
import ReporteEmpleado from './components/ReporteEmpleado';
import ReportePreview from './components/ReportePreview';
import ExportButtons from './components/ExportButtons';

// Exportaciones nombradas
export { 
  ReportesPage,
  ReporteGeneradoPage,
  ReporteSelector,
  ReporteQuincenal,
  ReporteEmpleado,
  ReportePreview,
  ExportButtons
};

// Exportación por defecto
export default {
  ReportesPage,
  ReporteGeneradoPage,
  ReporteSelector,
  ReporteQuincenal,
  ReporteEmpleado,
  ReportePreview,
  ExportButtons
};