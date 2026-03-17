import React, { useState } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { Input, Button, DatePicker } from '../../../components/common';

// ============================================
// COMPONENTE REGISTRO FILTER
// Filtros para la lista de registros
// ============================================

const RegistroFilter = ({ filtros, onChange, onSearch }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useState(filtros.search || '');

  // ========================================
  // HANDLERS
  // ========================================
  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    onChange({ ...filtros, search: localSearch, pagina: 1 });
    onSearch();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleFilterChange = (field, value) => {
    onChange({ ...filtros, [field]: value, pagina: 1 });
  };

  const handleDateChange = (date) => {
    onChange({ ...filtros, fecha: date, pagina: 1 });
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    onChange({
      search: '',
      fecha: null,
      empleadoId: '',
      tipo: '',
      pagina: 1
    });
    onSearch();
  };

  // ========================================
  // OPCIONES PARA FILTROS
  // ========================================
  const tiposRegistro = [
    { value: '', label: 'Todos' },
    { value: 'MANUAL', label: 'Manual' },
    { value: 'IMPORTADO', label: 'Importado' },
    { value: 'RELOJ', label: 'Reloj' }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-4">
      {/* Búsqueda principal */}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Input
            placeholder="Buscar por empleado, código..."
            value={localSearch}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            icon={Search}
          />
        </div>
        <Button onClick={handleSearchSubmit}>
          Buscar
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          icon={Filter}
        >
          {showAdvanced ? 'Ocultar filtros' : 'Filtros'}
        </Button>
        {(filtros.search || filtros.fecha || filtros.empleadoId || filtros.tipo) && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            icon={X}
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={filtros.fecha || ''}
              onChange={(e) => handleDateChange(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Tipo de registro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de registro
            </label>
            <select
              value={filtros.tipo || ''}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {tiposRegistro.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Empleado (podría ser un select con búsqueda) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empleado
            </label>
            <Input
              placeholder="ID o nombre de empleado"
              value={filtros.empleadoId || ''}
              onChange={(e) => handleFilterChange('empleadoId', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Filtros activos */}
      <div className="flex flex-wrap gap-2 text-sm">
        {filtros.fecha && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
            <Calendar size={14} className="mr-1" />
            {new Date(filtros.fecha).toLocaleDateString()}
          </span>
        )}
        {filtros.tipo && (
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
            Tipo: {filtros.tipo}
          </span>
        )}
      </div>
    </div>
  );
};

export default RegistroFilter;