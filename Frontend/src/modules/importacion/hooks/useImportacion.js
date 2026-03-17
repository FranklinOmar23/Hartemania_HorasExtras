import { useState, useCallback } from 'react';
import { importacionService } from '../../../services';
import { useUIStore } from '../../../store';

// ============================================
// HOOK PERSONALIZADO PARA IMPORTACIÓN
// ============================================

export const useImportacion = () => {
  const [importando, setImportando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useUIStore();

  // ========================================
  // IMPORTAR ARCHIVO
  // ========================================
  const importarArchivo = useCallback(async (file, mapeo = {}) => {
  console.log('🔍 useImportacion.importarArchivo recibió:', file?.name, file?.size);
  
  if (!file) {
    console.error('❌ Archivo undefined en importarArchivo');
    throw new Error('No se proporcionó archivo');
  }
  
  setImportando(true);
  try {
    // ✅ Pasar el archivo directamente, NO crear FormData aquí
    const resultado = await importacionService.importar(file, (progress) => {
      console.log('📊 Progreso:', progress);
    });
    
    return resultado;
  } catch (error) {
    console.error('❌ Error en importarArchivo:', error);
    showToast({
      type: 'error',
      message: error.message || 'Error al importar archivo'
    });
    throw error;
  } finally {
    setImportando(false);
  }
}, [showToast]);
  // ========================================
  // VALIDAR ARCHIVO
  // ========================================
const validarArchivo = useCallback(async (file) => {
  console.log('🔍 useImportacion.validarArchivo recibió:', file?.name, file?.size);
  
  if (!file) {
    console.error('❌ Archivo undefined en validarArchivo');
    throw new Error('No se proporcionó archivo');
  }
  
  try {
    const resultado = await importacionService.validar(file);
    console.log('✅ Resultado de validación (completo):', resultado);
    console.log('✅ resultado.valido:', resultado?.valido);
    console.log('✅ resultado.data:', resultado?.data);
    
    // Si el backend devuelve { success: true, data: { valido: true, ... } }
    if (resultado && resultado.data) {
      return resultado.data;
    }
    
    // Si el backend devuelve directamente { valido: true, ... }
    return resultado;
    
  } catch (error) {
    console.error('❌ Error en validarArchivo:', error);
    showToast({
      type: 'error',
      message: error.message || 'Error al validar archivo'
    });
    throw error;
  }
}, [showToast]);

  // ========================================
  // OBTENER HISTORIAL
  // ========================================
  const obtenerHistorial = useCallback(async () => {
    setLoading(true);
    try {
      const data = await importacionService.obtenerTodas({ limite: 50 });
      setHistorial(data.data || []);
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al cargar historial'
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // OBTENER IMPORTACIÓN POR ID
  // ========================================
  const obtenerImportacion = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await importacionService.obtenerPorId(id);
      return data;
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al cargar importación'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // OBTENER REGISTROS DE UNA IMPORTACIÓN
  // ========================================
  const obtenerRegistros = useCallback(async (id) => {
    try {
      const data = await importacionService.obtenerRegistros(id);
      return data;
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al cargar registros'
      });
      throw error;
    }
  }, [showToast]);

  // ========================================
  // OBTENER ERRORES DE UNA IMPORTACIÓN
  // ========================================
  const obtenerErrores = useCallback(async (id) => {
    try {
      const data = await importacionService.obtenerErrores(id);
      return data;
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al cargar errores'
      });
      throw error;
    }
  }, [showToast]);

  // ========================================
  // PROCESAR IMPORTACIÓN
  // ========================================
  const procesarImportacion = useCallback(async (id) => {
    setImportando(true);
    try {
      const resultado = await importacionService.procesar(id);
      showToast({
        type: 'success',
        message: 'Importación procesada correctamente'
      });
      return resultado;
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Error al procesar importación'
      });
      throw error;
    } finally {
      setImportando(false);
    }
  }, [showToast]);

  // ========================================
  // ELIMINAR IMPORTACIÓN
  // ========================================
  const eliminarImportacion = useCallback(async (id) => {
    try {
      await importacionService.eliminar(id);
      setHistorial(prev => prev.filter(i => i.id !== id));
      showToast({
        type: 'success',
        message: 'Importación eliminada'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al eliminar importación'
      });
      throw error;
    }
  }, [showToast]);

  // ========================================
  // DESCARGAR PLANTILLA
  // ========================================
  const descargarPlantilla = useCallback(async () => {
    try {
      await importacionService.descargarPlantilla();
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al descargar plantilla'
      });
    }
  }, [showToast]);

  return {
    // Estado
    importando,
    historial,
    loading,

    // Acciones
    importarArchivo,
    validarArchivo,
    obtenerHistorial,
    obtenerImportacion,
    obtenerRegistros,
    obtenerErrores,
    procesarImportacion,
    eliminarImportacion,
    descargarPlantilla
  };
};

export default useImportacion;