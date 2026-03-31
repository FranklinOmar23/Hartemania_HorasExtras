import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button, Select } from '../../../components/common';

// ============================================
// COMPONENTE CALCULO FORM
// Formulario para seleccionar período de cálculo
// ============================================

const CalculoForm = ({ periodo, onChange, onCalcular, loading }) => {
  // ========================================
  // OPCIONES
  // ========================================
  const años = [];
  for (let i = 2020; i <= 2030; i++) {
    años.push({ value: i, label: i.toString() });
  }

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

  const quincenas = [
    { value: 1, label: 'Primera Quincena (1-15)' },
    { value: 2, label: 'Segunda Quincena (16-fin)' }
  ];

  // ========================================
  // HANDLERS
  // ========================================
  const handleChange = (field, value) => {
    onChange({
      ...periodo,
      [field]: value
    });
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="rounded-[28px] border border-slate-200 bg-gradient-to-r from-white via-white to-emerald-50 p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Periodo de trabajo
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            Selecciona la quincena a procesar
          </h3>
        </div>
        <div className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 md:block">
          Motor de calculo activo
        </div>
      </div>

      <div className="flex flex-col items-end space-y-4 md:flex-row md:space-x-4 md:space-y-0">
      {/* Año */}
      <div className="flex-1">
        <Select
          label="Año"
          value={periodo.anio}
          onChange={(e) => handleChange('anio', parseInt(e.target.value))}
          options={años}
          placeholder="Seleccionar año"
        />
      </div>

      {/* Mes */}
      <div className="flex-1">
        <Select
          label="Mes"
          value={periodo.mes}
          onChange={(e) => handleChange('mes', parseInt(e.target.value))}
          options={meses}
          placeholder="Seleccionar mes"
        />
      </div>

      {/* Quincena */}
      <div className="flex-1">
        <Select
          label="Quincena"
          value={periodo.quincena}
          onChange={(e) => handleChange('quincena', parseInt(e.target.value))}
          options={quincenas}
          placeholder="Seleccionar quincena"
        />
      </div>

      {/* Botón calcular */}
      <div className="flex-shrink-0">
        <Button
          variant="primary"
          onClick={onCalcular}
          loading={loading}
          icon={Calendar}
          fullWidth
          className="min-w-[10rem]"
        >
          Calcular
        </Button>
      </div>
      </div>
    </div>
  );
};

export default CalculoForm;