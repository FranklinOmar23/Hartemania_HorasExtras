// ============================================
// src/modules/dashboard/index.js
// ============================================

// Primero importamos todos los componentes
import DashboardPage from './pages/DashboardPage';
import SummaryCards from './components/SummaryCards';
import HorasExtrasChart from './components/HorasExtrasChart';
import TopEmpleados from './components/TopEmpleados';
import UltimasImportaciones from './components/UltimasImportaciones';
import AlertasLimite from './components/AlertasLimite';
import useDashboardData from './hooks/useDashboardData';

// Exportaciones nombradas
export { 
  DashboardPage,
  SummaryCards,
  HorasExtrasChart,
  TopEmpleados,
  UltimasImportaciones,
  AlertasLimite,
  useDashboardData
};

// Exportación por defecto
export default {
  DashboardPage,
  SummaryCards,
  HorasExtrasChart,
  TopEmpleados,
  UltimasImportaciones,
  AlertasLimite,
  useDashboardData
};