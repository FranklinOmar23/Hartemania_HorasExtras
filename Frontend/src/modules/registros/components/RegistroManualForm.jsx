import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, User, Calendar, Clock } from 'lucide-react';
import { Input, Button, Select } from '../../../components/common';
import { useEmpleados } from '../../empleados/hooks/useEmpleados';

// ============================================
// ESQUEMA DE VALIDACIÓN CON ZOD
// ============================================
const registroSchema = z.object({
  empleadoId: z.string().min(1, 'El empleado es requerido'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  horaEntrada: z.string().optional(),
  horaSalida: z.string().optional(),
  comentarios: z.string().optional(),
  tipoRegistro: z.enum(['MANUAL', 'IMPORTADO', 'RELOJ']).default('MANUAL')
}).refine(data => {
  // Si hay hora de entrada o salida, validar formato
  if (data.horaEntrada) {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(data.horaEntrada);
  }
  return true;
}, {
  message: 'Formato de hora inválido (HH:MM)',
  path: ['horaEntrada']
}).refine(data => {
  if (data.horaSalida) {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(data.horaSalida);
  }
  return true;
}, {
  message: 'Formato de hora inválido (HH:MM)',
  path: ['horaSalida']
});

// ============================================
// COMPONENTE REGISTRO MANUAL FORM
// ============================================
const RegistroManualForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
  isEditing
}) => {
  const [calculos, setCalculos] = useState(null);
  const { empleados, fetchEmpleados } = useEmpleados();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registroSchema),
    defaultValues: initialData || {
      fecha: new Date().toISOString().split('T')[0],
      tipoRegistro: 'MANUAL'
    }
  });

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    fetchEmpleados({ activo: true });
  }, []);

  // Watch campos para cálculos
  const horaEntrada = watch('horaEntrada');
  const horaSalida = watch('horaSalida');
  const empleadoId = watch('empleadoId');

  // Calcular horas trabajadas
  useEffect(() => {
    if (horaEntrada && horaSalida && empleadoId) {
      calcularHoras();
    }
  }, [horaEntrada, horaSalida, empleadoId]);

  // ========================================
  // FUNCIONES
  // ========================================
  const calcularHoras = () => {
    if (!horaEntrada || !horaSalida) return;

    const [h1, m1] = horaEntrada.split(':').map(Number);
    const [h2, m2] = horaSalida.split(':').map(Number);

    let minutosEntrada = h1 * 60 + m1;
    let minutosSalida = h2 * 60 + m2;

    // Si la salida es menor, asumimos que pasó la medianoche
    if (minutosSalida < minutosEntrada) {
      minutosSalida += 24 * 60;
    }

    const minutosTrabajados = minutosSalida - minutosEntrada;
    const horasTrabajadas = minutosTrabajados / 60;

    // Calcular horas extras según jornada (simplificado)
    const jornadaNormal = 9; // 8:30 AM - 5:30 PM son 9 horas
    let horasExtras = Math.max(0, horasTrabajadas - jornadaNormal);

    setCalculos({
      horasTrabajadas: horasTrabajadas.toFixed(2),
      horasExtras: horasExtras.toFixed(2)
    });
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Selección de empleado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Empleado <span className="text-red-500">*</span>
        </label>
        <select
          {...register('empleadoId')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Seleccionar empleado...</option>
          {empleados.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.codigo} - {emp.nombre} {emp.apellido}
            </option>
          ))}
        </select>
        {errors.empleadoId && (
          <p className="mt-1 text-sm text-red-600">{errors.empleadoId.message}</p>
        )}
      </div>

      {/* Fecha */}
      <Input
        label="Fecha *"
        type="date"
        {...register('fecha')}
        error={errors.fecha?.message}
        icon={Calendar}
      />

      {/* Horas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Hora Entrada"
          type="time"
          {...register('horaEntrada')}
          error={errors.horaEntrada?.message}
          icon={Clock}
        />
        <Input
          label="Hora Salida"
          type="time"
          {...register('horaSalida')}
          error={errors.horaSalida?.message}
          icon={Clock}
        />
      </div>

      {/* Cálculos en tiempo real */}
      {calculos && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Vista previa del cálculo
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Horas trabajadas:</span>
              <span className="ml-2 font-medium text-blue-800">
                {calculos.horasTrabajadas} hrs
              </span>
            </div>
            <div>
              <span className="text-blue-600">Horas extras estimadas:</span>
              <span className="ml-2 font-medium text-blue-800">
                {calculos.horasExtras} hrs
              </span>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            * Este es un cálculo estimado. El cálculo final considerará la jornada laboral y días feriados.
          </p>
        </div>
      )}

      {/* Comentarios */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comentarios
        </label>
        <textarea
          {...register('comentarios')}
          rows="3"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Observaciones adicionales..."
        />
      </div>

      {/* Campo oculto para tipo de registro */}
      <input type="hidden" {...register('tipoRegistro')} value="MANUAL" />

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          icon={X}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={Save}
        >
          {isEditing ? 'Actualizar' : 'Guardar'} Registro
        </Button>
      </div>

      {/* Nota sobre registros manuales */}
      <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-700">
        <p>
          <strong>Nota:</strong> Los registros manuales serán considerados para el cálculo de horas extras
          junto con las importaciones automáticas.
        </p>
      </div>
    </form>
  );
};

export default RegistroManualForm;