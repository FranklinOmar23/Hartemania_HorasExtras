import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input, Button } from '../../../components/common';

// ============================================
// COMPONENTE EMPLEADO FILTER
// Filtros para la lista de empleados
// ============================================

const EmpleadoFilter = ({ filtros, onChange, onSearch }) => {
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

  const handleClearFilters = () => {
    setLocalSearch('');
    onChange({
      search: '',
      departamento: '',
      activo: true,
      pagina: 1
    });
    onSearch();
  };

  // ========================================
  // OPCIONES PARA FILTROS
  // ========================================
  const departamentos = [
    'Taller',
    'Impresión',
    'Instalación',
    'Administración',
    'Ventas',
    'Almacén'
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
            placeholder="Buscar por nombre, código o cédula..."
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
        {(filtros.search || filtros.departamento || filtros.activo !== undefined) && (
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <select
              value={filtros.departamento || ''}
              onChange={(e) => handleFilterChange('departamento', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Todos</option>
              {departamentos.map(depto => (
                <option key={depto} value={depto}>{depto}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtros.activo === undefined ? '' : filtros.activo}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange('activo', value === '' ? undefined : value === 'true');
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              value={filtros.orden || ''}
              onChange={(e) => handleFilterChange('orden', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Predeterminado</option>
              <option value="nombre">Nombre</option>
              <option value="codigo">Código</option>
              <option value="fechaIngreso">Fecha ingreso</option>
              <option value="salario">Salario</option>
            </select>
          </div>
        </div>
      )}

      {/* Resultados encontrados */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {filtros.totalRegistros || 0} empleados encontrados
        </span>
        {filtros.departamento && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Departamento: {filtros.departamento}
          </span>
        )}
      </div>
    </div>
  );
};

export default EmpleadoFilter;