import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

// ============================================
// COMPONENTE ALERT
// Alertas para mostrar mensajes al usuario
// ============================================

const Alert = ({
  type = 'info', // info, success, warning, error
  title,
  message,
  dismissible = false,
  onDismiss,
  autoClose = false,
  autoCloseTime = 5000,
  showIcon = true,
  className = '',
  children
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // ========================================
  // CONFIGURACIÓN POR TIPO
  // ========================================
  const config = {
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-400',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400'
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-400',
      textColor: 'text-green-800',
      iconColor: 'text-green-400'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      textColor: 'text-red-800',
      iconColor: 'text-red-400'
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  // ========================================
  // AUTO CIERRE
  // ========================================
  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoCloseTime);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, isVisible]);

  // ========================================
  // HANDLERS
  // ========================================
  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  // ========================================
  // RENDER
  // ========================================
  return (
    <div
      className={`rounded-md border-l-4 ${bgColor} ${borderColor} p-4 ${className}`}
      role="alert"
    >
      <div className="flex">
        {/* Icono */}
        {showIcon && Icon && (
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
          </div>
        )}

        {/* Contenido */}
        <div className={`flex-1 ${showIcon ? 'ml-3' : ''}`}>
          {title && (
            <h3 className={`text-sm font-medium ${textColor}`}>
              {title}
            </h3>
          )}
          
          {message && (
            <div className={`text-sm ${textColor} ${title ? 'mt-2' : ''}`}>
              <p>{message}</p>
            </div>
          )}

          {children && (
            <div className={`text-sm ${textColor} ${title || message ? 'mt-2' : ''}`}>
              {children}
            </div>
          )}
        </div>

        {/* Botón de cierre */}
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={handleDismiss}
              className={`inline-flex rounded-md ${bgColor} ${textColor} hover:${textColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <span className="sr-only">Cerrar</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// TOAST (notificación temporal)
// ============================================
export const Toast = ({
  type = 'info',
  message,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <Alert
        type={type}
        message={message}
        dismissible
        onDismiss={onClose}
        className="shadow-lg"
      />
    </div>
  );
};

export default Alert;