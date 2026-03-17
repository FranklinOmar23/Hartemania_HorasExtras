import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '../../../components/common';

// ============================================
// COMPONENTE DELETE CONFIRM MODAL
// Modal de confirmación para eliminar empleado
// ============================================

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  empleado,
  loading
}) => {
  if (!empleado) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar eliminación"
      size="sm"
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
          >
            Eliminar
          </Button>
        </div>
      }
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          ¿Eliminar empleado?
        </h3>
        
        <p className="text-sm text-gray-500 mb-4">
          Estás a punto de eliminar a <span className="font-semibold">
            {empleado.nombre} {empleado.apellido}
          </span> ({empleado.codigo}).
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left">
          <p className="text-sm text-yellow-700">
            <strong>Importante:</strong> Esta acción no se puede deshacer. 
            El empleado quedará inactivo en el sistema pero sus registros 
            de horas extras se conservarán por razones legales.
          </p>
        </div>

        {empleado.stats?.horasPendientes > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">
              ⚠️ Este empleado tiene {empleado.stats.horasPendientes} horas 
              extras pendientes de cálculo.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;