import React, { Fragment, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

// ============================================
// COMPONENTE MODAL
// Modal reutilizable con diferentes tamaños
// ============================================

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm, md, lg, xl, full
  showCloseButton = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  footer = null,
  className = '',
  ...props
}) => {
  // ========================================
  // TAMAÑOS
  // ========================================
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    const handleEsc = (event) => {
      if (closeOnEsc && event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEsc]);

  // ========================================
  // HANDLERS
  // ========================================
  const handleClickOutside = (event) => {
    if (closeOnClickOutside && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // ========================================
  // RENDER
  // ========================================
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={handleClickOutside}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full ${sizes[size]} ${className}`}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="bg-white px-4 py-3 border-b border-gray-200 sm:px-6 flex items-center justify-between">
              {title && (
                <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Cerrar</span>
                  <X size={20} />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="bg-white px-4 py-5 sm:p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MODAL DE CONFIRMACIÓN
// ============================================
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Está seguro que desea realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'danger',
  size = 'sm',
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-gray-500">{message}</p>
    </Modal>
  );
};

export default Modal;