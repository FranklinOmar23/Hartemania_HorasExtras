// ============================================
// src/modules/configuracion/index.js
// ============================================

// Primero importamos todos los componentes
import ConfiguracionPage from './pages/ConfiguracionPage';
import JornadasPage from './pages/JornadasPage';
import FeriadosPage from './pages/FeriadosPage';
import TiposHoraExtraPage from './pages/TiposHoraExtraPage';
import JornadaForm from './components/JornadaForm';
import FeriadoForm from './components/FeriadoForm';
import TipoHoraExtraForm from './components/TipoHoraExtraForm';
import ConfigTable from './components/ConfigTable';
import useJornadas from './hooks/useJornadas';
import useFeriados from './hooks/useFeriados';
import useTiposHE from './hooks/useTiposHE';

// Exportaciones nombradas
export { 
  ConfiguracionPage,
  JornadasPage,
  FeriadosPage,
  TiposHoraExtraPage,
  JornadaForm,
  FeriadoForm,
  TipoHoraExtraForm,
  ConfigTable,
  useJornadas,
  useFeriados,
  useTiposHE
};

// Exportación por defecto
export default {
  ConfiguracionPage,
  JornadasPage,
  FeriadosPage,
  TiposHoraExtraPage,
  JornadaForm,
  FeriadoForm,
  TipoHoraExtraForm,
  ConfigTable,
  useJornadas,
  useFeriados,
  useTiposHE
};