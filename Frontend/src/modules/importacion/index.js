// ============================================
// src/modules/importacion/index.js
// ============================================

// Primero importamos todos los componentes
import ImportacionPage from './pages/ImportacionPage';
import ImportacionDetallePage from './pages/ImportacionDetallePage';
import ExcelUploader from './components/ExcelUploader';
import PreviewTable from './components/PreviewTable';
import ValidationErrors from './components/ValidationErrors';
import MapeoColumnas from './components/MapeoColumnas';
import HistorialImportaciones from './components/HistorialImportaciones';
import ImportacionStatus from './components/ImportacionStatus';
import useImportacion from './hooks/useImportacion';
import usePreviewExcel from './hooks/usePreviewExcel';

// Exportaciones nombradas
export { 
  ImportacionPage,
  ImportacionDetallePage,
  ExcelUploader,
  PreviewTable,
  ValidationErrors,
  MapeoColumnas,
  HistorialImportaciones,
  ImportacionStatus,
  useImportacion,
  usePreviewExcel
};

// Exportación por defecto
export default {
  ImportacionPage,
  ImportacionDetallePage,
  ExcelUploader,
  PreviewTable,
  ValidationErrors,
  MapeoColumnas,
  HistorialImportaciones,
  ImportacionStatus,
  useImportacion,
  usePreviewExcel
};