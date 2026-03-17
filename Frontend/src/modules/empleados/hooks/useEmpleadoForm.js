import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { empleadosService } from '../../../services';
import { useUIStore } from '../../../store';

// ============================================
// HOOK PERSONALIZADO PARA FORMULARIO DE EMPLEADO
// ============================================

export const useEmpleadoForm = (id) => {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // ========================================
  // CARGAR EMPLEADO PARA EDICIÓN
  // ========================================
  const fetchEmpleado = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await empleadosService.obtenerPorId(id);
      setEmpleado(data);
    } catch (err) {
      setError(err.message);
      showToast({
        type: 'error',
        message: 'Error al cargar datos del empleado'
      });
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  // ========================================
  // GUARDAR EMPLEADO (CREAR O ACTUALIZAR)
  // ========================================
  const guardarEmpleado = useCallback(async (data) => {
    setGuardando(true);
    setError(null);

    try {
      // Formatear datos
      const formData = {
        ...data,
        salarioBase: parseFloat(data.salarioBase),
        activo: data.activo === true || data.activo === 'true'
      };

      let result;
      if (id) {
        // Actualizar
        result = await empleadosService.actualizar(id, formData);
      } else {
        // Crear
        result = await empleadosService.crear(formData);
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setGuardando(false);
    }
  }, [id]);

  // ========================================
  // VALIDAR CAMPOS EN TIEMPO REAL
  // ========================================
  const validarCampo = useCallback((name, value) => {
    switch (name) {
      case 'cedula':
        // Validar cédula dominicana
        if (value && value.length > 0) {
          const regex = /^\d{3}-\d{7}-\d{1}$/;
          return regex.test(value) ? null : 'Formato: 000-0000000-0';
        }
        return null;

      case 'telefono':
        if (value && value.length > 0) {
          const regex = /^\d{3}-\d{3}-\d{4}$/;
          return regex.test(value) ? null : 'Formato: 000-000-0000';
        }
        return null;

      case 'email':
        if (value && value.length > 0) {
          const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return regex.test(value) ? null : 'Email inválido';
        }
        return null;

      case 'salarioBase':
        if (value <= 0) {
          return 'El salario debe ser mayor a 0';
        }
        return null;

      default:
        return null;
    }
  }, []);

  // ========================================
  // CALCULAR VALORES DERIVADOS
  // ========================================
  const calcularValores = useCallback((salarioBase) => {
    if (!salarioBase || salarioBase <= 0) {
      return {
        salarioDiario: 0,
        salarioPorHora: 0
      };
    }

    const salarioDiario = salarioBase / 23.83;
    const salarioPorHora = salarioDiario / 8;

    return {
      salarioDiario: salarioDiario.toFixed(2),
      salarioPorHora: salarioPorHora.toFixed(2)
    };
  }, []);

  return {
    // Estado
    empleado,
    loading,
    guardando,
    error,

    // Acciones
    fetchEmpleado,
    guardarEmpleado,
    validarCampo,
    calcularValores
  };
};

export default useEmpleadoForm;