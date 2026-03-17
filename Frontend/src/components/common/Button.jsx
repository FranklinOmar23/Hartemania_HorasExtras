// ============================================
// src/components/common/Button.jsx
// ============================================

import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props
}) => {
  // Variantes de color
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 disabled:bg-yellow-300',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-100',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:bg-transparent'
  };

  // Tamaños
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Clases base
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';
  const widthClass = fullWidth ? 'w-full' : '';
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      {...props}
    >
      {loading && (
        <Loader2 className="animate-spin mr-2" size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />
      )}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="mr-2" size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />
      )}
      
      {children}
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="ml-2" size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />
      )}
    </button>
  );
};

// Button Group
export const ButtonGroup = ({ children, orientation = 'horizontal', className = '' }) => {
  const orientationClass = orientation === 'horizontal' 
    ? 'flex flex-row space-x-2' 
    : 'flex flex-col space-y-2';

  return (
    <div className={`${orientationClass} ${className}`}>
      {children}
    </div>
  );
};

// Icon Button
export const IconButton = ({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  label,
  ...props
}) => {
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`rounded-full ${sizeClasses[size]}`}
      aria-label={label}
      {...props}
    >
      <Icon size={iconSizes[size]} />
    </Button>
  );
};

export default Button;