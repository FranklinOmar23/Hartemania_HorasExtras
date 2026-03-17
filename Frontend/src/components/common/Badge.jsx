import React from 'react';

// ============================================
// COMPONENTE BADGE
// Etiquetas para mostrar estados o categorías
// ============================================

const Badge = ({
  children,
  variant = 'default', // default, primary, success, warning, danger, info
  size = 'md', // sm, md, lg
  rounded = 'full', // full, md, lg
  icon: Icon,
  className = '',
  ...props
}) => {
  // ========================================
  // VARIANTES
  // ========================================
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-indigo-100 text-indigo-800'
  };

  // ========================================
  // TAMAÑOS
  // ========================================
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  // ========================================
  // BORDES REDONDEADOS
  // ========================================
  const roundedStyles = {
    full: 'rounded-full',
    md: 'rounded-md',
    lg: 'rounded-lg'
  };

  return (
    <span
      className={`inline-flex items-center font-medium ${variants[variant]} ${sizes[size]} ${roundedStyles[rounded]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`mr-1 ${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`} />}
      {children}
    </span>
  );
};

// ============================================
// VARIANTES ESPECÍFICAS
// ============================================
export const StatusBadge = ({ status, ...props }) => {
  const statusMap = {
    activo: { variant: 'success', label: 'Activo' },
    inactivo: { variant: 'danger', label: 'Inactivo' },
    pendiente: { variant: 'warning', label: 'Pendiente' },
    procesado: { variant: 'success', label: 'Procesado' },
    error: { variant: 'danger', label: 'Error' },
    importado: { variant: 'info', label: 'Importado' },
    manual: { variant: 'primary', label: 'Manual' }
  };

  const config = statusMap[status?.toLowerCase()] || { variant: 'default', label: status };

  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  );
};

export const TipoHEBadge = ({ tipo, ...props }) => {
  const tipoMap = {
    '35%': { variant: 'primary', label: '35%' },
    '100%': { variant: 'success', label: '100%' },
    '15%': { variant: 'warning', label: '15%' },
    'FERIADO': { variant: 'danger', label: 'Feriado' }
  };

  const config = tipoMap[tipo] || { variant: 'default', label: tipo };

  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  );
};

export default Badge;