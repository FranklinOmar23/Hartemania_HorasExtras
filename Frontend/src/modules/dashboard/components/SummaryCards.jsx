import React from 'react';
import { 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../../../components/common';
import { formatearMoneda, formatearHoras } from '../../../utils';

// ============================================
// COMPONENTE SUMMARY CARDS
// Tarjetas de resumen para el dashboard
// ============================================

const SummaryCards = ({ data, periodo }) => {
  // ========================================
  // CONFIGURACIÓN DE TARJETAS
  // ========================================
  const cards = [
    {
      title: 'Total Horas Extras',
      value: formatearHoras(data?.totalHoras || 0),
      subtitle: `${data?.empleadosConHE || 0} empleados`,
      icon: Clock,
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Total a Pagar',
      value: formatearMoneda(data?.totalPagar || 0),
      subtitle: `Promedio: ${formatearMoneda((data?.totalPagar || 0) / (data?.empleadosConHE || 1))}`,
      icon: DollarSign,
      color: 'bg-green-50',
      textColor: 'text-green-600',
      iconColor: 'text-green-500',
      borderColor: 'border-green-200'
    },
    {
      title: 'Empleados Activos',
      value: data?.empleadosActivos || 0,
      subtitle: `${data?.empleadosConHE || 0} con HE este mes`,
      icon: Users,
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Días con HE',
      value: data?.diasConHE || 0,
      subtitle: `de ${data?.diasLaborables || 22} días laborables`,
      icon: Calendar,
      color: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      iconColor: 'text-yellow-500',
      borderColor: 'border-yellow-200'
    }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.color} border ${card.borderColor} hover:shadow-md transition-shadow`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${card.textColor} mb-1`}>
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </p>
              <p className="text-xs text-gray-500">
                {card.subtitle}
              </p>
            </div>
            <div className={`p-3 rounded-full bg-white bg-opacity-50 ${card.textColor}`}>
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
          </div>

          {/* Barra de progreso (opcional) */}
          {index === 0 && data?.limiteTrimestral && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progreso trimestral</span>
                <span>{Math.round((data.totalHoras / data.limiteTrimestral) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    (data.totalHoras / data.limiteTrimestral) > 0.8 
                      ? 'bg-red-500' 
                      : (data.totalHoras / data.limiteTrimestral) > 0.6 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (data.totalHoras / data.limiteTrimestral) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default SummaryCards;