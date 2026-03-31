import React from 'react';

// ============================================
// COMPONENTE CARD
// Tarjeta para contener información
// ============================================

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  bordered = true,
  shadow = true,
  padding = true,
  className = '',
  ...props
}) => {
  // ========================================
  // CLASES
  // ========================================
  const baseClasses = 'overflow-hidden rounded-lg bg-white';
  const borderClasses = bordered ? 'border border-gray-200' : '';
  const shadowClasses = shadow ? 'shadow' : '';
  const paddingClasses = padding ? 'p-4 sm:p-5 lg:p-6' : '';

  return (
    <div
      className={`${baseClasses} ${borderClasses} ${shadowClasses} ${className}`}
      {...props}
    >
      {/* Header */}
      {(title || subtitle || headerAction) && (
        <div className={`border-b border-gray-200 ${paddingClasses}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
            {headerAction && (
              <div className="sm:ml-4">{headerAction}</div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={paddingClasses}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={`border-t border-gray-200 bg-gray-50 ${paddingClasses}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

// ============================================
// SUBCOMPONENTES
// ============================================
Card.Body = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

Card.Header = ({ children, className = '' }) => (
  <div className={`border-b border-gray-200 ${className}`}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`border-t border-gray-200 bg-gray-50 ${className}`}>{children}</div>
);

export default Card;