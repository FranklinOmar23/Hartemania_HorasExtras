import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Input from './Input';
import Button from './Button';

// ============================================
// COMPONENTE SEARCHBAR
// Barra de búsqueda con debounce
// ============================================

const SearchBar = ({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  debounceTime = 500,
  showButton = false,
  buttonText = 'Buscar',
  className = '',
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  // ========================================
  // DEBOUNCE
  // ========================================
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange) {
        onChange(searchTerm);
      }
      if (onSearch && !showButton) {
        onSearch(searchTerm);
      }
    }, debounceTime);

    return () => clearTimeout(handler);
  }, [searchTerm, debounceTime, onChange, onSearch, showButton]);

  // ========================================
  // HANDLERS
  // ========================================
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onChange) {
      onChange('');
    }
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <form onSubmit={handleSubmit} className={`flex items-center space-x-2 ${className}`}>
      <div className="relative flex-1">
        <Input
          value={searchTerm}
          onChange={handleChange}
          placeholder={placeholder}
          icon={Search}
          iconPosition="left"
          className="pr-10"
          {...props}
        />
        
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {showButton && (
        <Button type="submit" variant="primary">
          {buttonText}
        </Button>
      )}
    </form>
  );
};

// ============================================
// FILTERBAR (con filtros adicionales)
// ============================================
export const FilterBar = ({
  onSearch,
  filters = [],
  onFilterChange,
  className = ''
}) => {
  return (
    <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
      <SearchBar
        onSearch={onSearch}
        placeholder="Buscar..."
        className="mb-4"
      />

      {filters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filters.map((filter) => (
            <div key={filter.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.name, e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Todos</option>
                  {filter.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type={filter.type || 'text'}
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.name, e.target.value)}
                  placeholder={filter.placeholder}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;