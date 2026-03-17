import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { createPortal } from 'react-dom';

// ============================================
// CONTEXTO DE TOAST
// ============================================
const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
};

// ============================================
// COMPONENTE TOAST
// Notificaciones temporales
// ============================================

const ToastItem = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isExiting, setIsExiting] = useState(false);

  // ========================================
  // CONFIGURACIÓN POR TIPO
  // ========================================
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-400',
      textColor: 'text-green-800',
      iconColor: 'text-green-400'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      textColor: 'text-red-800',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-400',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400'
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  // ========================================
  // AUTO CIERRE
  // ========================================
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  // ========================================
  // HANDLERS
  // ========================================
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Duración de la animación
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div
      className={`
        ${bgColor} border-l-4 ${borderColor} rounded-md p-4 shadow-lg mb-3
        transform transition-all duration-300 ease-in-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      role="alert"
    >
      <div className="flex items-start">
        {/* Icono */}
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

        {/* Contenido */}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${textColor}`}>
              {title}
            </h3>
          )}
          {message && (
            <div className={`text-sm ${textColor} ${title ? 'mt-1' : ''}`}>
              <p>{message}</p>
            </div>
          )}
        </div>

        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className={`ml-4 flex-shrink-0 ${textColor} hover:${textColor} focus:outline-none`}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// ============================================
// TOAST CONTAINER
// ============================================
const ToastContainer = ({ toasts, removeToast }) => {
  return createPortal(
    <div className="fixed top-4 right-4 z-50 w-96">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>,
    document.body
  );
};

// ============================================
// TOAST PROVIDER
// ============================================
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, ...toast }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const updateToast = (id, newToast) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, ...newToast } : toast))
    );
  };

  const clearToasts = () => {
    setToasts([]);
  };

  // Métodos de conveniencia
  const success = (message, options = {}) => {
    return addToast({
      type: 'success',
      title: options.title || 'Éxito',
      message,
      duration: options.duration || 5000,
      ...options
    });
  };

  const error = (message, options = {}) => {
    return addToast({
      type: 'error',
      title: options.title || 'Error',
      message,
      duration: options.duration || 7000,
      ...options
    });
  };

  const warning = (message, options = {}) => {
    return addToast({
      type: 'warning',
      title: options.title || 'Advertencia',
      message,
      duration: options.duration || 6000,
      ...options
    });
  };

  const info = (message, options = {}) => {
    return addToast({
      type: 'info',
      title: options.title || 'Información',
      message,
      duration: options.duration || 5000,
      ...options
    });
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        updateToast,
        clearToasts,
        success,
        error,
        warning,
        info
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// ============================================
// HOOK DE TOAST (para usar fuera del contexto)
// ============================================
export const useToastNotifications = () => {
  const toast = useToast();
  return toast;
};

// ============================================
// COMPONENTE TOAST (simple, sin contexto)
// ============================================
export const SimpleToast = ({
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose
}) => {
  return (
    <ToastItem
      id="simple-toast"
      type={type}
      title={title}
      message={message}
      duration={duration}
      onClose={onClose}
    />
  );
};

export default ToastProvider;