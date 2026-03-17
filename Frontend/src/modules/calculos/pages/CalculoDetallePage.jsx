import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Calendar, Clock, DollarSign } from 'lucide-react';
import { Button, Card, Badge, Alert } from '../../../components/common';
import { formatearMoneda, formatearFecha, formatearHoras } from '../../../utils';

// ============================================
// PÁGINA DE DETALLE DE CÁLCULO
// ============================================

const CalculoDetallePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { empleado, periodo } = location.state || {};

  // ========================================
  // VALIDACIÓN
  // ========================================
  if (!empleado) {
    return (
      <Alert
        type="warning"
        title="No encontrado"
        message="No se encontró el detalle del empleado"
        className="mb-6"
      />
    );
  }

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver
        </button>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={Printer}
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
          <Button
            variant="outline"
            icon={Download}
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* Información del empleado */}
      <Card title="Información del Empleado">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Código</p>
            <p className="text-lg font-semibold">{empleado.codigo || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="text-lg font-semibold">{empleado.nombre || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Período</p>
            <p className="text-lg font-semibold">
              {periodo?.mes}/{periodo?.anio} - Q{periodo?.quincena}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total a Pagar</p>
            <p className="text-lg font-semibold text-green-600">
              {formatearMoneda(empleado.totalPagar || 0)}
            </p>
          </div>
        </div>
      </Card>

      {/* Resumen de horas */}
      <Card title="Horas Extras Calculadas">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">HE 35%</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatearHoras(empleado.horas35 || 0)}
            </p>
            <p className="text-xs text-blue-500 mt-1">
              {formatearMoneda(empleado.monto35 || 0)}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 mb-1">HE 100%</p>
            <p className="text-2xl font-bold text-green-700">
              {formatearHoras(empleado.horas100 || 0)}
            </p>
            <p className="text-xs text-green-500 mt-1">
              {formatearMoneda(empleado.monto100 || 0)}
            </p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 mb-1">HE 15%</p>
            <p className="text-2xl font-bold text-yellow-700">
              {formatearHoras(empleado.horas15 || 0)}
            </p>
            <p className="text-xs text-yellow-500 mt-1">
              {formatearMoneda(empleado.monto15 || 0)}
            </p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 mb-1">HE Feriado</p>
            <p className="text-2xl font-bold text-red-700">
              {formatearHoras(empleado.horasFeriado || 0)}
            </p>
            <p className="text-xs text-red-500 mt-1">
              {formatearMoneda(empleado.montoFeriado || 0)}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-purple-700">
              {formatearHoras(
                (empleado.horas35 || 0) + 
                (empleado.horas100 || 0) + 
                (empleado.horas15 || 0) + 
                (empleado.horasFeriado || 0)
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Información adicional */}
      <Card title="Información Adicional">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Monto 35%</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatearMoneda(empleado.monto35 || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Monto 100%</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatearMoneda(empleado.monto100 || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Monto 15%</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatearMoneda(empleado.monto15 || 0)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalculoDetallePage;