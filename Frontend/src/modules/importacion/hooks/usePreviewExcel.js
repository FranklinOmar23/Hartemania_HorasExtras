// src/modules/importacion/hooks/usePreviewExcel.js
import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useUIStore } from '../../../store';

// ============================================
// HOOK PERSONALIZADO PARA PREVIEW DE EXCEL
// ============================================

export const usePreviewExcel = () => {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useUIStore();

  // ========================================
  // GENERAR PREVIEW DEL EXCEL
  // ========================================
  const generarPreview = useCallback(async (file) => {
    setLoading(true);
    setError(null);

    try {
      const data = await leerExcelHartemania(file);
      console.log('📊 Preview generado:', data);
      setPreviewData(data);
      return data;
    } catch (err) {
      console.error('❌ Error en generarPreview:', err);
      setError(err.message);
      showToast({
        type: 'error',
        message: 'Error al generar vista previa'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // LIMPIAR PREVIEW
  // ========================================
  const limpiarPreview = useCallback(() => {
    setPreviewData(null);
    setError(null);
  }, []);

  return {
    previewData,
    loading,
    error,
    generarPreview,
    limpiarPreview
  };
};

// ========================================
// FUNCIÓN ESPECÍFICA PARA TU FORMATO DE EXCEL
// ========================================
const leerExcelHartemania = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        console.log('📋 Filas del Excel:', rows.slice(0, 10));

        // Buscar la fila de encabezados (fila 4, índice 3)
        let headerRow = -1;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (!row) continue;
          
          // Buscar "Nombre completo" en la primera columna
          if (row[0] && row[0].toString().includes('Nombre completo')) {
            headerRow = i;
            break;
          }
        }

        if (headerRow === -1) {
          throw new Error('No se encontró la fila de encabezados (Nombre completo)');
        }

        // Obtener nombres de columnas
        const headers = rows[headerRow] || [];
        const columnas = headers.filter(h => h && h.toString().trim() !== '').map(h => h.toString().trim());

        const registros = [];

        // Procesar datos desde la siguiente fila
        for (let i = headerRow + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 6) continue;

          // Extraer datos según las columnas
          const nombreCompleto = row[0]?.toString().trim() || '';
          const codigo = row[1]?.toString().trim() || '';
          const departamento = row[2]?.toString().trim() || '';
          const fecha = row[3] ? parseFecha(row[3]) : null;
          const horaEntrada = row[4] ? parseHora(row[4]) : null;
          const horaSalida = row[5] ? parseHora(row[5]) : null;

          // Saltar filas sin código o sin fecha
          if (!codigo || codigo === '' || codigo === '--') continue;
          if (!fecha) continue;

          registros.push({
            fila: i + 1,
            fecha,
            codigo,
            nombre: nombreCompleto,
            departamento,
            horaEntrada,
            horaSalida,
            // Datos raw para depuración
            raw: row
          });
        }

        resolve({
          nombre: file.name,
          hojas: workbook.SheetNames,
          hojaActual: sheetName,
          columnas,
          headers,
          registros,
          totalFilas: rows.length
        });

      } catch (err) {
        reject(new Error('Error al procesar el archivo Excel: ' + err.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsArrayBuffer(file);
  });
};

// ========================================
// FUNCIONES AUXILIARES
// ========================================
const parseFecha = (valor) => {
  if (!valor || valor === '--' || valor === '') return null;
  
  // Formato "2026-02-02"
  if (typeof valor === 'string') {
    const match = valor.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  
  // Si es número de Excel
  if (typeof valor === 'number') {
    const fecha = new Date((valor - 25569) * 86400 * 1000);
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return null;
};

const parseHora = (valor) => {
  if (!valor || valor === '--' || valor === '') return null;
  
  // Formato "8:30" o "08:30"
  if (typeof valor === 'string') {
    const match = valor.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      return `${match[1].padStart(2, '0')}:${match[2]}`;
    }
  }
  
  // Si es número de Excel (0.35416667 = 8:30)
  if (typeof valor === 'number') {
    const totalMinutos = Math.round(valor * 24 * 60);
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }
  
  return null;
};

export default usePreviewExcel;