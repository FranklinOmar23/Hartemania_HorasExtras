import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X } from 'lucide-react';
import { Input, Button } from '../../../components/common';

// ============================================
// ESQUEMA DE VALIDACIÓN
// ============================================
const jornadaSchema = z.object({
  diaSemana: z.number().min(0).max(6),
  diaNombre: z.string().min(1, 'El nombre del día es requerido'),
  horaEntrada: z.string().optional(),
  horaSalida: z.string().optional(),
  horasBase: z.number().min(0, 'Las horas base deben ser mayores a 0'),
  aplicaHorasExtras: z.boolean().default(true),
  porcentajeExtra: z.number().min(0).max(200).optional(),
  activo: z.boolean().default(true)
});

// ============================================
// COMPONENTE JORNADA FORM
// ============================================
const JornadaForm = ({ initialData, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(jornadaSchema),
    defaultValues: initialData || {
      diaSemana: 1,
      diaNombre: '',
      horaEntrada: '08:30',
      horaSalida: '17:30',
      horasBase: 8,
      aplicaHorasExtras: true,
      porcentajeExtra: 35,
      activo: true
    }
  });

  const aplicaHorasExtras = watch('aplicaHorasExtras');

  // ========================================
  // OPCIONES DE DÍAS
  // ========================================
  const diasSemana = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Día de la semana */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Día de la semana <span className="text-red-500">*</span>
        </label>
        <select
          {...register('diaSemana', { valueAsNumber: true })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          {diasSemana.map(dia => (
            <option key={dia.value} value={dia.value}>
              {dia.label}
            </option>
          ))}
        </select>
      </div>

      {/* Nombre del día (autocompletado) */}
      <input
        type="hidden"
        {...register('diaNombre')}
        value={diasSemana.find(d => d.value === watch('diaSemana'))?.label || ''}
      />

      {/* Horarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Hora de entrada"
          type="time"
          {...register('horaEntrada')}
          error={errors.horaEntrada?.message}
        />
        <Input
          label="Hora de salida"
          type="time"
          {...register('horaSalida')}
          error={errors.horaSalida?.message}
        />
      </div>

      {/* Horas base */}
      <Input
        label="Horas base de la jornada"
        type="number"
        step="0.5"
        {...register('horasBase', { valueAsNumber: true })}
        error={errors.horasBase?.message}
        helperText="Número de horas de la jornada regular"
      />

      {/* Aplica horas extras */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          {...register('aplicaHorasExtras')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label className="text-sm text-gray-700">
          Aplica horas extras en este día
        </label>
      </div>

      {/* Porcentaje extra (condicional) */}
      {aplicaHorasExtras && (
        <Input
          label="Porcentaje de horas extras"
          type="number"
          min="0"
          max="200"
          {...register('porcentajeExtra', { valueAsNumber: true })}
          error={errors.porcentajeExtra?.message}
          helperText="Porcentaje adicional sobre el valor de la hora normal"
          icon="%"
        />
      )}

      {/* Estado activo */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          {...register('activo')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label className="text-sm text-gray-700">
          Jornada activa
        </label>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          icon={X}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          icon={Save}
        >
          Guardar
        </Button>
      </div>
    </form>
  );
};

export default JornadaForm;