import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X } from 'lucide-react';
import { Input, Button } from '../../../components/common';

// ============================================
// ESQUEMA DE VALIDACIÓN
// ============================================
const tipoHESchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  porcentaje: z.number().min(0).max(200, 'El porcentaje debe estar entre 0 y 200'),
  factorMultiplicador: z.number().min(1).max(3),
  colorHex: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color hexadecimal inválido'),
  orden: z.number().min(0).default(0),
  aplicaFinSemana: z.boolean().default(false),
  aplicaFeriados: z.boolean().default(false),
  aplicaNocturno: z.boolean().default(false),
  activo: z.boolean().default(true)
});

// ============================================
// COMPONENTE TIPO HORA EXTRA FORM
// ============================================
const TipoHoraExtraForm = ({ initialData, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(tipoHESchema),
    defaultValues: initialData || {
      codigo: '',
      nombre: '',
      descripcion: '',
      porcentaje: 35,
      factorMultiplicador: 1.35,
      colorHex: '#3B82F6',
      orden: 0,
      aplicaFinSemana: false,
      aplicaFeriados: false,
      aplicaNocturno: false,
      activo: true
    }
  });

  // ========================================
  // CALCULAR FACTOR AUTOMÁTICAMENTE
  // ========================================
  const porcentaje = watch('porcentaje');
  
  React.useEffect(() => {
    const factor = 1 + (porcentaje / 100);
    setValue('factorMultiplicador', parseFloat(factor.toFixed(2)));
  }, [porcentaje, setValue]);

  // ========================================
  // RENDER
  // ========================================
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Código y nombre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Código *"
          {...register('codigo')}
          error={errors.codigo?.message}
          placeholder="Ej: 35%, 100%, 15%"
        />
        <Input
          label="Nombre *"
          {...register('nombre')}
          error={errors.nombre?.message}
          placeholder="Ej: Horas Extras Diurnas"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          {...register('descripcion')}
          rows="2"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Descripción del tipo de hora extra..."
        />
      </div>

      {/* Porcentaje y factor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Porcentaje *"
          type="number"
          min="0"
          max="200"
          {...register('porcentaje', { valueAsNumber: true })}
          error={errors.porcentaje?.message}
          icon="%"
        />
        <Input
          label="Factor multiplicador"
          type="number"
          step="0.01"
          {...register('factorMultiplicador', { valueAsNumber: true })}
          error={errors.factorMultiplicador?.message}
          disabled
          helperText="Calculado automáticamente"
        />
      </div>

      {/* Color y orden */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              {...register('colorHex')}
              className="h-10 w-20 rounded border border-gray-300"
            />
            <input
              type="text"
              {...register('colorHex')}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          {errors.colorHex && (
            <p className="mt-1 text-sm text-red-600">{errors.colorHex.message}</p>
          )}
        </div>

        <Input
          label="Orden"
          type="number"
          {...register('orden', { valueAsNumber: true })}
          error={errors.orden?.message}
          helperText="Para ordenar en listados"
        />
      </div>

      {/* Aplicaciones */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Aplica en:</h4>
        
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            {...register('aplicaFinSemana')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">
            Fines de semana (sábados y domingos)
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            {...register('aplicaFeriados')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">
            Días feriados
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            {...register('aplicaNocturno')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">
            Horario nocturno (después de 9:00 PM)
          </label>
        </div>
      </div>

      {/* Estado activo */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          {...register('activo')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label className="text-sm text-gray-700">
          Tipo de hora extra activo
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

export default TipoHoraExtraForm;