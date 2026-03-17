import React from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2,
  Upload,
  FileText
} from 'lucide-react';
import { Modal, Button, Badge } from '../../../components/common';
import { formatearFecha, formatearHora, formatearHoras, formatearMoneda } from '../../../utils';

// ============================================
// COMPONENTE REGISTRO DETALLE MODAL
// Modal con detalle completo del registro
// ============================================

const RegistroDetalleModal = ({ isOpen, onClose, registro, onEditar }) => {
  if (!registro) return null;

  // ========================================
  // CONFIGURACIÓN DE TIPO
  // ========================================
  const getTipoConfig = (tipo) => {
    const tipos = {
      IMPORTADO: { label: 'Importado', icon: Upload, variant: 'info' },
      MANUAL: { label: 'Manual', icon: Clock, variant: 'primary' },
      RELOJ: { label: 'Reloj', icon: Clock, variant: 'success' }
    };
    return tipos[tipo] || tipos.IMPORTADO;
  };

  const tipoConfig = getTipoConfig(registro.tipoRegistro);
  const TipoIcon = tipoConfig.icon;

  // ========================================
  // RENDER
  // ========================================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle del Registro"
      size="lg"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onEditar(registro);
            }}
            icon={Edit}
          >
            Editar
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header con tipo */}
        <div className="flex items-center justify-between">
          <Badge variant={tipoConfig.variant} size="md" icon={TipoIcon}>
            {tipoConfig.label}
          </Badge>
          <span className="text-xs text-gray-400">
            ID: {registro.id}
          </span>
        </div>

        {/* Información del empleado */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <User size={16} className="mr-2" />
            Empleado
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Nombre</p>
              <p className="text-sm font-medium text-gray-900">
                {registro.empleadoNombre}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Código</p>
              <p className="text-sm font-medium text-gray-900">
                {registro.codigoEmpleado}
              </p>
            </div>
          </div>
        </div>

        {/* Fecha y horas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center text-blue-600 mb-1">
              <Calendar size={14} className="mr-1" />
              <span className="text-xs">Fecha</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatearFecha(registro.fecha)}
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center text-green-600 mb-1">
              <Clock size={14} className="mr-1" />
              <span className="text-xs">Entrada</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatearHora(registro.horaEntrada) || '—'}
            </p>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center text-yellow-600 mb-1">
              <Clock size={14} className="mr-1" />
              <span className="text-xs">Salida</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatearHora(registro.horaSalida) || '—'}
            </p>
          </div>
        </div>

        {/* Horas extras calculadas */}
        <div className="border-t border-b border-gray-200 py-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Horas Extras Calculadas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-xs text-gray-500">HE 35%</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatearHoras(registro.he35 || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">HE 100%</p>
              <p className="text-lg font-semibold text-green-600">
                {formatearHoras(registro.he100 || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">HE 15%</p>
              <p className="text-lg font-semibold text-yellow-600">
                {formatearHoras(registro.he15 || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Feriado</p>
              <p className="text-lg font-semibold text-red-600">
                {formatearHoras(registro.heFeriado || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Montos (si están calculados) */}
        {registro.monto35 && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-700 mb-2">
              Monto a Pagar
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-purple-600">35%</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatearMoneda(registro.monto35)}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-600">100%</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatearMoneda(registro.monto100)}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-600">15%</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatearMoneda(registro.monto15)}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-600">Feriado</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatearMoneda(registro.montoFeriado)}
                </p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-purple-200 flex justify-between">
              <span className="text-sm font-medium text-purple-700">Total</span>
              <span className="text-lg font-bold text-purple-700">
                {formatearMoneda(registro.totalPagar)}
              </span>
            </div>
          </div>
        )}

        {/* Comentarios */}
        {registro.comentarios && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-start">
              <FileText size={14} className="text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Comentarios</p>
                <p className="text-sm text-gray-700">{registro.comentarios}</p>
              </div>
            </div>
          </div>
        )}

        {/* Metadatos */}
        <div className="text-xs text-gray-400 border-t pt-4">
          <p>Creado: {new Date(registro.fechaCreacion).toLocaleString()}</p>
          {registro.fechaActualizacion && (
            <p>Actualizado: {new Date(registro.fechaActualizacion).toLocaleString()}</p>
          )}
          {registro.importacionId && (
            <p className="mt-1">
              Importación ID: {registro.importacionId} • Fila: {registro.filaExcel}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RegistroDetalleModal;