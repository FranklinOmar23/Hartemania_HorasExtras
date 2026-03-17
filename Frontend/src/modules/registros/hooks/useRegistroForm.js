import { useState, useCallback } from 'react';
import { registrosService } from '../../../services';
import { useUIStore } from '../../../store';

// ============================================
// HOOK PERSONALIZADO PARA FORMULARIO DE REGISTRO
// ============================================

export const useRegistroForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useUIStore();

  // ========================================
  // CARGAR REGISTRO PARA EDICIÓN
  // ========================================
  const cargarRegistro = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const data = await registrosService.obtenerPorId(id);
      return data;
    } catch (err) {
      setError(err.message);
      showToast({
        type: 'error',
        message: 'Error al cargar el registro'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // GUARDAR REGISTRO (CREAR O ACTUALIZAR)
  // ========================================
  const guardarRegistro = useCallback(async (data, id = null) => {
    setLoading(true);
    setError(null);

    try {
      // Formatear datos
      const formData = {
        ...data,
        fecha: new Date(data.fecha).toISOString().split('T')[0]
      };

      let result;
      if (id) {
        // Actualizar
        result = await registrosService.actualizar(id, formData);
      } else {
        // Crear
        result = await registrosService.crearManual(formData);
      }

      return result;
    } catch (err) {
      setError(err.message);
      showToast({
        type: 'error',
        message: err.message || 'Error al guardar el registro'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ========================================
  // VALIDAR HORAS
  // ========================================
  const validarHoras = useCallback((entrada, salida) => {
    if (!entrada || !salida) return { valido: true };

    const [h1, m1] = entrada.split(':').map(Number);
    const [h2, m2] = salida.split(':').map(Number);

    const minutosEntrada = h1 * 60 + m1;
    const minutosSalida = h2 * 60 + m2;

    // Permitir que pase la medianoche
    const minutosTrabajados = minutosSalida < minutosEntrada
      ? (24 * 60 - minutosEntrada) + minutosSalida
      : minutosSalida - minutosEntrada;

    if (minutosTrabajados > 16 * 60) { // Más de 16 horas
      return {
        valido: false,
        mensaje: 'El período trabajado no puede exceder 16 horas'
      };
    }

    return { valido: true };
  }, []);

  // ========================================
  // CALCULAR HORAS EXTRAS ESTIMADAS
  // ========================================
  const calcularHorasExtras = useCallback((entrada, salida) => {
    if (!entrada || !salida) return 0;

    const [h1, m1] = entrada.split(':').map(Number);
    const [h2, m2] = salida.split(':').map(Number);

    let minutosEntrada = h1 * 60 + m1;
    let minutosSalida = h2 * 60 + m2;

    if (minutosSalida < minutosEntrada) {
      minutosSalida += 24 * 60;
    }

    const minutosTrabajados = minutosSalida - minutosEntrada;
    const horasTrabajadas = minutosTrabajados / 60;

    // Jornada normal: 8:30 AM - 5:30 PM (9 horas)
    const jornadaNormal = 9;
    const horasExtras = Math.max(0, horasTrabajadas - jornadaNormal);

    return horasExtras;
  }, []);

  return {
    loading,
    error,
    cargarRegistro,
    guardarRegistro,
    validarHoras,
    calcularHorasExtras
  };
};

export default useRegistroForm;