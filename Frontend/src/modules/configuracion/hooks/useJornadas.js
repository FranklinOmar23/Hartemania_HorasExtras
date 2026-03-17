import { useState, useCallback } from 'react';
import { configuracionService } from '../../../services';
import { useUIStore } from '../../../store';
import { DIAS_SEMANA } from '../../../config/constants';

// ============================================
// HOOK PERSONALIZADO PARA JORNADAS
// ============================================

export const useJornadas = () => {
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useUIStore();

  // ========================================
  // OBTENER JORNADAS
  // ========================================
  const fetchJornadas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await configuracionService.jornadas.obtenerTodas();
      
      // Ordenar por día de la semana
      const ordenadas = data.sort((a, b) => a.diaSemana - b.diaSemana);
      
      setJornadas(ordenadas);
    } catch (err) {
      setError(err.message);
      showToast({
        type: 'error',
        message: 'Error al cargar jornadas'
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // OBTENER JORNADA POR ID
  // ========================================
  const obtenerJornada = useCallback(async (id) => {
    try {
      const data = await configuracionService.jornadas.obtenerPorId(id);
      return data;
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Error al cargar la jornada'
      });
      throw err;
    }
  }, [showToast]);

  // ========================================
  // CREAR JORNADA
  // ========================================
  const crearJornada = useCallback(async (data) => {
    setLoading(true);
    try {
      const nuevo = await configuracionService.jornadas.crear(data);
      showToast({
        type: 'success',
        message: 'Jornada creada correctamente'
      });
      return nuevo;
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al crear jornada'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // ACTUALIZAR JORNADA
  // ========================================
  const actualizarJornada = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const actualizado = await configuracionService.jornadas.actualizar(id, data);
      showToast({
        type: 'success',
        message: 'Jornada actualizada correctamente'
      });
      return actualizado;
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al actualizar jornada'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // ELIMINAR JORNADA
  // ========================================
  const eliminarJornada = useCallback(async (id) => {
    setLoading(true);
    try {
      await configuracionService.jornadas.eliminar(id);
      setJornadas(prev => prev.filter(j => j.id !== id));
      showToast({
        type: 'success',
        message: 'Jornada eliminada correctamente'
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al eliminar jornada'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // OBTENER JORNADA POR DÍA
  // ========================================
  const obtenerPorDia = useCallback(async (diaSemana) => {
    try {
      const data = await configuracionService.jornadas.obtenerPorDia(diaSemana);
      return data;
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Error al cargar jornada del día'
      });
      throw err;
    }
  }, [showToast]);

  return {
    jornadas,
    loading,
    error,
    fetchJornadas,
    obtenerJornada,
    crearJornada,
    actualizarJornada,
    eliminarJornada,
    obtenerPorDia
  };
};

export default useJornadas;