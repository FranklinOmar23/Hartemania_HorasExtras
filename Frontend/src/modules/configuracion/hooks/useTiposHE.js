import { useState, useCallback } from 'react';
import { configuracionService } from '../../../services';
import { useUIStore } from '../../../store';
import { TIPOS_HORAS_EXTRAS } from '../../../config/constants';

// ============================================
// HOOK PERSONALIZADO PARA TIPOS DE HE
// ============================================

export const useTiposHE = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useUIStore();

  // ========================================
  // OBTENER TIPOS DE HE
  // ========================================
  const fetchTipos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await configuracionService.tiposHE.obtenerTodos();
      
      // Ordenar por orden
      const ordenados = data.sort((a, b) => a.orden - b.orden);
      
      setTipos(ordenados);
    } catch (err) {
      setError(err.message);
      showToast({
        type: 'error',
        message: 'Error al cargar tipos de HE'
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // OBTENER TIPO POR ID
  // ========================================
  const obtenerTipo = useCallback(async (id) => {
    try {
      const data = await configuracionService.tiposHE.obtenerPorId(id);
      return data;
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Error al cargar el tipo de HE'
      });
      throw err;
    }
  }, [showToast]);

  // ========================================
  // CREAR TIPO
  // ========================================
  const crearTipo = useCallback(async (data) => {
    setLoading(true);
    try {
      const nuevo = await configuracionService.tiposHE.crear(data);
      showToast({
        type: 'success',
        message: 'Tipo de HE creado correctamente'
      });
      return nuevo;
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al crear tipo de HE'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // ACTUALIZAR TIPO
  // ========================================
  const actualizarTipo = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const actualizado = await configuracionService.tiposHE.actualizar(id, data);
      showToast({
        type: 'success',
        message: 'Tipo de HE actualizado correctamente'
      });
      return actualizado;
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al actualizar tipo de HE'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // ELIMINAR TIPO
  // ========================================
  const eliminarTipo = useCallback(async (id) => {
    setLoading(true);
    try {
      await configuracionService.tiposHE.eliminar(id);
      setTipos(prev => prev.filter(t => t.id !== id));
      showToast({
        type: 'success',
        message: 'Tipo de HE eliminado correctamente'
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al eliminar tipo de HE'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // OBTENER TIPO POR CÓDIGO
  // ========================================
  const obtenerPorCodigo = useCallback(async (codigo) => {
    try {
      const data = await configuracionService.tiposHE.obtenerPorCodigo(codigo);
      return data;
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Error al buscar tipo de HE'
      });
      throw err;
    }
  }, [showToast]);

  // ========================================
  // RESETEAR A VALORES POR DEFECTO
  // ========================================
  const resetearPorDefecto = useCallback(async () => {
    setLoading(true);
    try {
      // Aquí iría la lógica para resetear a valores por defecto
      const tiposDefault = Object.values(TIPOS_HORAS_EXTRAS).map((t, index) => ({
        id: index + 1,
        codigo: t.codigo,
        nombre: t.nombre,
        porcentaje: t.porcentaje,
        factorMultiplicador: t.factor,
        colorHex: t.color,
        orden: index + 1,
        aplicaFinSemana: t.aplicaFinSemana,
        aplicaFeriados: t.aplicaFeriados,
        aplicaNocturno: t.aplicaNocturno,
        activo: true
      }));
      
      setTipos(tiposDefault);
      showToast({
        type: 'success',
        message: 'Tipos de HE restablecidos a valores por defecto'
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Error al restablecer tipos de HE'
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    tipos,
    loading,
    error,
    fetchTipos,
    obtenerTipo,
    crearTipo,
    actualizarTipo,
    eliminarTipo,
    obtenerPorCodigo,
    resetearPorDefecto
  };
};

export default useTiposHE;