import React from 'react';
import { Edit, Trash2, Eye, MoreVertical, User, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { Card, Badge } from '../../../components/common';
import { formatearMoneda, formatearFecha } from '../../../utils';

// ============================================
// COMPONENTE EMPLEADO CARD
// Tarjeta para vista móvil de empleados
// ============================================

const EmpleadoCard = ({ empleado, onEditar, onEliminar, onVerDetalle }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  if (!empleado) return null;

  return (
    <Card className="relative hover:shadow-lg transition-shadow">
      {/* Menú de acciones (móvil) */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <MoreVertical size={18} className="text-gray-500" />
        </button>
        
        {showMenu && (
          <>
            {/* Overlay para cerrar al hacer click fuera */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menú */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
              <div className="py-1">
                <button
                  onClick={() => {
                    onVerDetalle(empleado.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye size={16} className="mr-2" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEditar(empleado.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit size={16} className="mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    onEliminar(empleado);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-2" />
                  Eliminar
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Avatar/Iniciales */}
      <div className="flex items-center mb-4">
        <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
          <span className="text-xl font-bold text-white">
            {empleado.nombre?.charAt(0)}{empleado.apellido?.charAt(0)}
          </span>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {empleado.nombre} {empleado.apellido}
          </h3>
          <p className="text-sm text-gray-500 flex items-center">
            <Briefcase size={14} className="mr-1" />
            {empleado.posicion || 'Sin posición'}
          </p>
        </div>
      </div>

      {/* Información */}
      <div className="space-y-3 text-sm border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 flex items-center">
            <User size={14} className="mr-1" />
            Código:
          </span>
          <span className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
            {empleado.codigo}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 flex items-center">
            <DollarSign size={14} className="mr-1" />
            Salario:
          </span>
          <span className="font-medium text-green-600">
            {formatearMoneda(empleado.salarioBase)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 flex items-center">
            <Calendar size={14} className="mr-1" />
            Ingreso:
          </span>
          <span className="text-gray-900">
            {formatearFecha(empleado.fechaIngreso)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Departamento:</span>
          <span className="text-gray-900">{empleado.departamento || '—'}</span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-gray-500">Estado:</span>
          <Badge variant={empleado.activo ? 'success' : 'danger'} size="md">
            {empleado.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      {/* Botones de acción para desktop */}
      <div className="hidden sm:flex justify-end space-x-2 mt-4 pt-3 border-t">
        <button
          onClick={() => onVerDetalle(empleado.id)}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Ver detalles"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={() => onEditar(empleado.id)}
          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => onEliminar(empleado)}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </Card>
  );
};

export default EmpleadoCard;