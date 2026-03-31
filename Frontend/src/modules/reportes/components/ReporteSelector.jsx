import React, { useState } from 'react';
import { Calendar, Users, BarChart3, Search } from 'lucide-react';
import { Input, Button, Select } from '../../../components/common';

// ============================================
// COMPONENTE REPORTE SELECTOR
// Selector de parámetros para reportes
// ============================================

const ReporteSelector = ({ tipo, onGenerar, loading }) => {
  const [parametros, setParametros] = useState({
    anio: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    quincena: 1,
    empleadoId: '',
    fechaInicio: '',
    fechaFin: ''
  });

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
    setParametros(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerar({
      ...parametros,
      tipo
    });
  };

  // ========================================
  // RENDER SEGÚN TIPO
  // ========================================
  const renderQuincenal = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Select
        label="Año"
        value={parametros.anio}
        onChange={(e) => handleChange('anio', parseInt(e.target.value))}
        options={años}
      />
      <Select
        label="Mes"
        value={parametros.mes}
        onChange={(e) => handleChange('mes', parseInt(e.target.value))}
        options={meses}
      />
      <Select
        label="Quincena"
        value={parametros.quincena}
        onChange={(e) => handleChange('quincena', parseInt(e.target.value))}
        options={quincenas}
      />
    </div>
  );

  const renderEmpleado = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Select
        label="Año"
        value={parametros.anio}
        onChange={(e) => handleChange('anio', parseInt(e.target.value))}
        options={años}
      />
      <Select
        label="Mes"
        value={parametros.mes}
        onChange={(e) => handleChange('mes', parseInt(e.target.value))}
        options={meses}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Empleado
        </label>
        <div className="relative">
          <Input
            placeholder="Buscar empleado..."
            value={parametros.empleadoId}
            onChange={(e) => handleChange('empleadoId', e.target.value)}
            icon={Search}
          />
        </div>
      </div>
    </div>
  );

  const renderComparativo = () => (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Año
        </label>
        <Select
          value={parametros.anio}
          onChange={(e) => handleChange('anio', parseInt(e.target.value))}
          options={años}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Fecha inicio"
          type="date"
          value={parametros.fechaInicio}
          onChange={(e) => handleChange('fechaInicio', e.target.value)}
        />
        <Input
          label="Fecha fin"
          type="date"
          value={parametros.fechaFin}
          onChange={(e) => handleChange('fechaFin', e.target.value)}
        />
      </div>
    </div>
  );

  // ========================================
  // RENDER PRINCIPAL
  // ========================================
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {tipo === 'quincenal' && renderQuincenal()}
      {tipo === 'empleado' && renderEmpleado()}
      {tipo === 'comparativo' && renderComparativo()}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={Calendar}
          size="lg"
          className="w-full sm:w-auto"
        >
          Generar Reporte
        </Button>
      </div>
    </form>
  );
};

export default ReporteSelector;