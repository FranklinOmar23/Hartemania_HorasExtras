import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X } from 'lucide-react';
import { Input, Button } from '../../../components/common';

// ============================================
// ESQUEMA DE VALIDACIÓN
// ============================================
const feriadoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  dia: z.number().min(1).max(31),
  mes: z.number().min(1).max(12),
  anio: z.number().nullable().optional(),
  esFijo: z.boolean().default(true),
  aplicaPorcentaje100: z.boolean().default(true),
  activo: z.boolean().default(true)
});

// ============================================
// COMPONENTE FERIADO FORM
// ============================================
const FeriadoForm = ({ initialData, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(feriadoSchema),
    defaultValues: initialData || {
      nombre: '',
      dia: 1,
      mes: 1,
      anio: null,
      esFijo: true,
      aplicaPorcentaje100: true,
      activo: true
    }
  });

  const esFijo = watch('esFijo');

  // ========================================
  // OPCIONES
  // ========================================
  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre del feriado */}
      <Input
        label="Nombre del feriado *"
        {...register('nombre')}
        error={errors.nombre?.message}
        placeholder="Ej: Día de la Independencia"
      />

      {/* Día y mes */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Día *
          </label>
          <input
            type="number"
            min="1"
            max="31"
            {...register('dia', { valueAsNumber: true })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.dia && (
            <p className="mt-1 text-sm text-red-600">{errors.dia.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mes *
          </label>
          <select
            {...register('mes', { valueAsNumber: true })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {meses.map(mes => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Año (para feriados no fijos) */}
      {!esFijo && (
        <Input
          label="Año (opcional)"
          type="number"
          {...register('anio', { valueAsNumber: true })}
          placeholder="Dejar en blanco si aplica todos los años"
        />
      )}

      {/* Tipo de feriado */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            {...register('esFijo')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">
            Feriado fijo (misma fecha todos los años)
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            {...register('aplicaPorcentaje100')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">
            Aplica 100% de recargo
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            {...register('activo')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">
            Feriado activo
          </label>
        </div>
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

export default FeriadoForm;