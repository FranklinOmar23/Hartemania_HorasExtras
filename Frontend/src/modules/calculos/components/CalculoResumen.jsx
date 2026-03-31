import React from 'react';
import { DollarSign, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, Spinner } from '../../../components/common';
import { formatearMoneda, formatearHoras } from '../../../utils';
import { LIMITES_LEGALES } from '../../../config/constants';

// ============================================
// COMPONENTE CALCULO RESUMEN
// Tarjetas de resumen con totales
// ============================================

const CalculoResumen = ({ totales, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!totales) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">
          No hay datos para mostrar
        </p>
      </Card>
    );
  }

  // Verificar límite legal
  const totalHoras = totales.totalHoras || 0;
  const limiteExcedido = totalHoras > LIMITES_LEGALES.HORAS_EXTRAS_MAX_TRIMESTRE;

  // ========================================
  // TARJETAS DE RESUMEN
  // ========================================
  const tarjetas = [
    {
      titulo: 'Total Horas Extras',
      valor: formatearHoras(totalHoras),
      icono: Clock,
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-500'
    },
    {
      titulo: 'Total a Pagar',
      valor: formatearMoneda(totales.totalPagar || 0),
      icono: DollarSign,
      color: 'bg-green-50',
      textColor: 'text-green-600',
      iconColor: 'text-green-500'
    },
    {
      titulo: 'Promedio por Empleado',
      valor: formatearMoneda((totales.totalPagar || 0) / (totales.cantidadEmpleados || 1)),
      icono: TrendingUp,
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconColor: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {tarjetas.map((tarjeta, idx) => (
          <div key={idx} className={`${tarjeta.color} rounded-[28px] border border-white/70 p-6 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${tarjeta.textColor} mb-1`}>
                  {tarjeta.titulo}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {tarjeta.valor}
                </p>
              </div>
              <tarjeta.icono className={`h-10 w-10 ${tarjeta.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Desglose por tipo */}
      <Card title="Desglose por Tipo de Hora Extra" className="rounded-[30px] border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
            <p className="text-sm text-blue-600 mb-1">HE 35%</p>
            <p className="text-xl font-bold text-gray-900">
              {formatearHoras(totales.horas35 || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatearMoneda(totales.monto35 || 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50/40 p-4">
            <p className="text-sm text-green-600 mb-1">HE 100%</p>
            <p className="text-xl font-bold text-gray-900">
              {formatearHoras(totales.horas100 || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatearMoneda(totales.monto100 || 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-200 bg-yellow-50/40 p-4">
            <p className="text-sm text-yellow-600 mb-1">HE 15%</p>
            <p className="text-xl font-bold text-gray-900">
              {formatearHoras(totales.horas15 || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatearMoneda(totales.monto15 || 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4">
            <p className="text-sm text-red-600 mb-1">HE Feriado</p>
            <p className="text-xl font-bold text-gray-900">
              {formatearHoras(totales.horasFeriado || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatearMoneda(totales.montoFeriado || 0)}
            </p>
          </div>
        </div>
      </Card>

      {/* Estadísticas adicionales */}
      <Card title="Estadísticas" className="rounded-[30px] border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-gray-500">Empleados con HE</p>
            <p className="text-2xl font-bold text-gray-900">
              {totales.empleadosConHE || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Empleados</p>
            <p className="text-2xl font-bold text-gray-900">
              {totales.cantidadEmpleados || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Días con HE</p>
            <p className="text-2xl font-bold text-gray-900">
              {totales.diasConHE || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Promedio HE/día</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatearHoras((totalHoras) / (totales.diasConHE || 1))}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalculoResumen;