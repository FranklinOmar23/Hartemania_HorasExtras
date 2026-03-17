import { useState, useCallback } from 'react';
import { configuracionService } from '../../../services';
import { useUIStore } from '../../../store';

// ============================================
// HOOK PERSONALIZADO PARA FERIADOS
// ============================================

export const useFeriados = () => {
  const [feriados, setFeriados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useUIStore();

  // ========================================
  // OBTENER FERIADOS
  // ========================================
  const fetchFeriados = useCallback(async (anio = null) => {
    setLoading(true);
    setError(null);

    try {
      const data = await configuracionService.feriados.obtenerTodos(anio);
      
      // Ordenar por mes y día
      const ordenados = data.sort((a, b) => {
        if (a.mes !== b.mes) return a.mes - b.mes;
        return a.dia - b.dia;
      });
      
      setFeriados(ordenados);
    } catch (err) {
      setError(err.message);
      showToast({
        type: 'error',
        message: 'Error al cargar feriados'
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // OBTENER FERIADO POR ID
  // ========================================
  const obtenerFeriado = useCallback(async (id) => {
    try {
      const data = await configuracionService.feriados.obtenerPorId(id);
      return data;
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Error al cargar el feriado'
      });
      throw err;
    }
  }, [showToast]);

  // ========================================
  // CREAR FERIADO
  // ========================================
  const crearFeriado = useCallback(async (data) => {
    setLoading(true);
    try {
      const nuevo = await configuracionService.feriados.crear(data);
      showToast({
        type: 'success',
        message: 'Feriado creado correctamente'
      });
      return nuevo;
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al crear feriado'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // ACTUALIZAR FERIADO
  // ========================================
  const actualizarFeriado = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const actualizado = await configuracionService.feriados.actualizar(id, data);
      showToast({
        type: 'success',
        message: 'Feriado actualizado correctamente'
      });
      return actualizado;
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al actualizar feriado'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // ELIMINAR FERIADO
  // ========================================
  const eliminarFeriado = useCallback(async (id) => {
    setLoading(true);
    try {
      await configuracionService.feriados.eliminar(id);
      setFeriados(prev => prev.filter(f => f.id !== id));
      showToast({
        type: 'success',
        message: 'Feriado eliminado correctamente'
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al eliminar feriado'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // VERIFICAR SI UNA FECHA ES FERIADO
  // ========================================
  const esFeriado = useCallback(async (fecha) => {
    try {
      const result = await configuracionService.feriados.esFeriado(fecha);
      return result;
    } catch (err) {
      console.error('Error al verificar feriado:', err);
      return false;
    }
  }, []);

  return {
    feriados,
    loading,
    error,
    fetchFeriados,
    obtenerFeriado,
    crearFeriado,
    actualizarFeriado,
    eliminarFeriado,
    esFeriado
  };
};

export default useFeriados;