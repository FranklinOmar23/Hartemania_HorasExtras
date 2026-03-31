import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X } from 'lucide-react';
import { Input, Button } from '../../../components/common';
import { formatearMoneda } from '../../../utils';
import { validarCedula, validarTelefono } from '../../../utils/validators';

// ============================================
// ESQUEMA DE VALIDACIÓN CON ZOD
// ============================================
const empleadoSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  cedula: z.string().optional().refine(
    (val) => !val || validarCedula(val),
    { message: 'Cédula inválida' }
  ),
  rnc: z.string().optional(),
  posicion: z.string().optional(),
  departamento: z.string().optional(),
  salarioBase: z.number().min(0, 'El salario debe ser mayor a 0'),
  fechaIngreso: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional().refine(
    (val) => !val || validarTelefono(val),
    { message: 'Teléfono inválido' }
  ),
  direccion: z.string().optional(),
  tipoJornada: z.enum(['DIURNA', 'NOCTURNA', 'MIXTA']).default('DIURNA'),
  activo: z.boolean().default(true)
});

// ============================================
// COMPONENTE EMPLEADO FORM
// ============================================
const EmpleadoForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
  isEditing
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(empleadoSchema),
    defaultValues: initialData || {
      activo: true,
      tipoJornada: 'DIURNA'
    }
  });

  // ========================================
  // OPCIONES PARA SELECTS
  // ========================================
  const departamentos = [
    'Taller',
    'Impresión',
    'Instalación',
    'Administración',
    'Ventas',
    'Almacén'
  ];

  const tipoJornadaOptions = [
    { value: 'DIURNA', label: 'Diurna (8:30 AM - 5:30 PM)' },
    { value: 'NOCTURNA', label: 'Nocturna (9:00 PM - 7:00 AM)' },
    { value: 'MIXTA', label: 'Mixta' }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Datos básicos */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Datos Básicos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Código *"
            {...register('codigo')}
            error={errors.codigo?.message}
            disabled={isEditing}
          />
          <Input
            label="Nombre *"
            {...register('nombre')}
            error={errors.nombre?.message}
          />
          <Input
            label="Apellido *"
            {...register('apellido')}
            error={errors.apellido?.message}
          />
          <Input
            label="Cédula"
            {...register('cedula')}
            error={errors.cedula?.message}
            placeholder="000-0000000-0"
          />
          <Input
            label="RNC"
            {...register('rnc')}
            error={errors.rnc?.message}
            placeholder="0-00-00000-0"
          />
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Teléfono"
            {...register('telefono')}
            error={errors.telefono?.message}
            placeholder="809-555-5555"
          />
        </div>
      </div>

      {/* Datos laborales */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Datos Laborales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posición
            </label>
            <Input
              {...register('posicion')}
              error={errors.posicion?.message}
              placeholder="Ej: Chofer, Instalador, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <select
              {...register('departamento')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Seleccionar...</option>
              {departamentos.map(depto => (
                <option key={depto} value={depto}>{depto}</option>
              ))}
            </select>
          </div>
          <Input
            label="Salario Base *"
            type="number"
            step="0.01"
            {...register('salarioBase', { valueAsNumber: true })}
            error={errors.salarioBase?.message}
          />
          <Input
            label="Fecha de Ingreso"
            type="date"
            {...register('fechaIngreso')}
            error={errors.fechaIngreso?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Jornada
            </label>
            <select
              {...register('tipoJornada')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {tipoJornadaOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Dirección"
            {...register('direccion')}
            error={errors.direccion?.message}
          />
        </div>
      </div>

      {/* Estado */}
      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('activo')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Empleado activo</span>
        </label>
      </div>

      {/* Campos calculados (solo lectura) */}
      {isEditing && initialData && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Valores calculados
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Salario diario:</span>
              <span className="ml-2 font-medium">
                {formatearMoneda(initialData.salarioBase / 23.83)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Salario por hora:</span>
              <span className="ml-2 font-medium">
                {formatearMoneda(initialData.salarioBase / 23.83 / 8)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4">
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
          {isEditing ? 'Actualizar' : 'Guardar'} Empleado
        </Button>
      </div>
    </form>
  );
};

export default EmpleadoForm;