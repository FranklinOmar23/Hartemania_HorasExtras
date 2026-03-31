import React, { useEffect } from 'react';
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
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-2xl',
    xl: 'max-w-2xl sm:max-w-4xl',
    full: 'max-w-full mx-2 sm:mx-4'
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
      <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-screen items-end justify-center p-2 text-center sm:items-center sm:p-4">
        <div
          className={`relative my-2 w-full overflow-hidden rounded-[24px] border border-white/70 bg-white text-left shadow-2xl shadow-slate-900/15 transition-all sm:my-8 sm:rounded-[28px] ${sizes[size]} ${className}`}
          {...props}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-amber-100 via-white to-emerald-100 opacity-80" />

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="relative flex items-center justify-between gap-3 border-b border-slate-100 bg-white/90 px-4 py-4 sm:px-6">
              {title && (
                <h3 className="pr-2 text-base font-semibold leading-6 text-slate-900 sm:text-lg" id="modal-title">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                >
                  <span className="sr-only">Cerrar</span>
                  <X size={20} />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="relative bg-white px-4 py-4 sm:p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-6">
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
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
};

export default Modal;