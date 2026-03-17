import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ChevronRight, User } from 'lucide-react';
import { Card, Badge, Button, Spinner } from '../../../components/common';
import { formatearMoneda, formatearHoras } from '../../../utils';

// ============================================
// COMPONENTE TOP EMPLEADOS
// Lista de empleados con más horas extras
// ============================================

const TopEmpleados = ({ empleados = [], loading, onVerTodos }) => {
  const navigate = useNavigate();

  // ========================================
  // MEDALLAS POR POSICIÓN
  // ========================================
  const getMedalla = (index) => {
    switch (index) {
      case 0:
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Award className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-sm text-gray-500">{index + 1}</span>;
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <Card 
      title="Top Empleados" 
      subtitle="Empleados con más horas extras este mes"
      headerAction={
        <Button variant="ghost" size="sm" onClick={onVerTodos}>
          Ver todos <ChevronRight size={16} className="ml-1" />
        </Button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : empleados.length === 0 ? (
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No hay datos para mostrar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {empleados.map((emp, index) => (
            <div
              key={emp.id}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => navigate(`/empleados/${emp.id}`)}
            >
              {/* Posición */}
              <div className="flex-shrink-0 w-8">
                {getMedalla(index)}
              </div>

              {/* Avatar/Iniciales */}
              <div className="flex-shrink-0 ml-2">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {emp.nombre?.charAt(0) || '?'}
                  </span>
                </div>
              </div>

              {/* Información */}
              <div className="flex-1 ml-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {emp.nombre}
                  </p>
                  <Badge variant="primary" size="sm">
                    {emp.codigo}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {emp.posicion || 'Sin cargo'}
                  </p>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">
                      {formatearHoras(emp.totalHoras)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatearMoneda(emp.totalPagar)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Total acumulado */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total acumulado</span>
              <span className="font-semibold text-gray-900">
                {formatearHoras(empleados.reduce((sum, e) => sum + (e.totalHoras || 0), 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TopEmpleados;