import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

// ============================================
// COMPONENTE INPUT
// Campo de entrada reutilizable con validación
// ============================================

const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  readOnly = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  containerClassName = '',
  labelClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  // Determinar tipo de input para password
  const inputType = type === 'password' 
    ? (showPassword ? 'text' : 'password')
    : type;

  // ========================================
  // CLASES DINÁMICAS
  // ========================================
  const baseClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed';
  
  const errorClasses = error 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
    : '';

  const iconClasses = Icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Icono izquierdo */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={`${baseClasses} ${errorClasses} ${iconClasses} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />

        {/* Icono derecho (incluyendo password toggle) */}
        {(Icon && iconPosition === 'right') || type === 'password' ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {type === 'password' ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            ) : Icon ? (
              <Icon className="h-5 w-5 text-gray-400" />
            ) : null}
          </div>
        ) : null}

        {/* Icono de error */}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>

      {/* Mensaje de error o ayuda */}
      {(error || helperText) && (
        <p
          className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}
          id={error ? `${props.id}-error` : undefined}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// ========================================
// TEXTAREA
// ========================================
export const Textarea = forwardRef(({
  label,
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        {...props}
      />
    </div>
  );
});

Textarea.displayName = 'Textarea';

// ========================================
// SELECT
// ========================================
export const Select = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  error,
  ...props
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        value={value}
        onChange={onChange}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
          error ? 'border-red-300' : ''
        }`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(({ value: optValue, label: optLabel }) => (
          <option key={optValue} value={optValue}>
            {optLabel}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// ========================================
// CHECKBOX
// ========================================
export const Checkbox = forwardRef(({
  label,
  checked,
  onChange,
  error,
  ...props
}, ref) => {
  return (
    <div className="flex items-start mb-4">
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          {...props}
        />
      </div>
      {label && (
        <div className="ml-3 text-sm">
          <label className="font-medium text-gray-700">{label}</label>
        </div>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// ========================================
// RADIO
// ========================================
export const Radio = forwardRef(({
  label,
  checked,
  onChange,
  name,
  value,
  ...props
}, ref) => {
  return (
    <div className="flex items-center mb-4">
      <input
        ref={ref}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
        {...props}
      />
      {label && (
        <label className="ml-3 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

export default Input;