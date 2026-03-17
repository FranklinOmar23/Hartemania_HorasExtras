import React from 'react';
import { Loader2 } from 'lucide-react';

// ============================================
// COMPONENTE SPINNER
// Indicador de carga animado
// ============================================

const Spinner = ({
  size = 'md', // sm, md, lg
  color = 'primary', // primary, secondary, white
  fullScreen = false,
  text = null,
  className = ''
}) => {
  // ========================================
  // TAMAÑOS
  // ========================================
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // ========================================
  // COLORES
  // ========================================
  const colors = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin ${sizes[size]} ${colors[color]}`} />
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// ============================================
// LOADING OVERLAY
// ============================================
export const LoadingOverlay = ({ isLoading, children }) => {
  if (!isLoading) return children;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <Spinner />
      </div>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    </div>
  );
};

// ============================================
// LOADING DOTS (alternativo)
// ============================================
export const LoadingDots = ({ color = 'primary', size = 'md' }) => {
  const sizes = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3'
  };

  const colors = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    white: 'bg-white'
  };

  return (
    <div className="flex space-x-1">
      <div className={`${sizes[size]} ${colors[color]} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${sizes[size]} ${colors[color]} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${sizes[size]} ${colors[color]} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );
};

export default Spinner;