import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '../../../components/common';

// ============================================
// COMPONENTE REGISTRO CALENDARIO
// Vista de calendario de registros
// ============================================

const RegistroCalendario = ({ registros = [], onSelectDate, onSelectRegistro }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // ========================================
  // FUNCIONES DEL CALENDARIO
  // ========================================
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Agrupar registros por fecha
  const registrosPorFecha = registros.reduce((acc, reg) => {
    const fecha = format(new Date(reg.fecha), 'yyyy-MM-dd');
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(reg);
    return acc;
  }, {});

  // Obtener resumen del día
  const getDaySummary = (date) => {
    const fechaKey = format(date, 'yyyy-MM-dd');
    const dayRegistros = registrosPorFecha[fechaKey] || [];
    
    const totalHoras = dayRegistros.reduce((sum, reg) => {
      return sum + (reg.totalHoras || 0);
    }, 0);

    const empleados = new Set(dayRegistros.map(r => r.empleadoId)).size;

    return {
      count: dayRegistros.length,
      empleados,
      totalHoras,
      registros: dayRegistros
    };
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date) => {
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isToday_ = isToday(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const summary = getDaySummary(date);
          const hasRegistros = summary.count > 0;

          return (
            <div
              key={date.toString()}
              className={`
                min-h-24 p-2 border rounded-lg transition-colors
                ${!isCurrentMonth && 'bg-gray-50 text-gray-400'}
                ${isToday_ && 'border-blue-300'}
                ${isSelected && 'ring-2 ring-blue-500'}
                ${hasRegistros ? 'cursor-pointer hover:bg-blue-50' : 'cursor-default'}
              `}
              onClick={() => {
                if (hasRegistros) {
                  setSelectedDate(date);
                  onSelectDate(date);
                }
              }}
            >
              <div className="text-right text-sm mb-2">
                {format(date, 'd')}
              </div>

              {hasRegistros && (
                <div className="space-y-1">
                  <Badge variant="info" size="sm" className="w-full justify-center">
                    {summary.count} registro{summary.count !== 1 ? 's' : ''}
                  </Badge>
                  
                  {summary.totalHoras > 0 && (
                    <div className="text-xs text-center text-gray-600">
                      {summary.totalHoras.toFixed(1)} hrs
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 pt-4 border-t">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div>
          <span>Con registros</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 border border-blue-300 rounded mr-1"></div>
          <span>Hoy</span>
        </div>
      </div>

      {/* Registros del día seleccionado */}
      {selectedDate && registrosPorFecha[format(selectedDate, 'yyyy-MM-dd')] && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Registros del {format(selectedDate, 'dd/MM/yyyy')}
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {registrosPorFecha[format(selectedDate, 'yyyy-MM-dd')].map(reg => (
              <div
                key={reg.id}
                className="flex items-center justify-between p-2 bg-white rounded hover:bg-blue-50 cursor-pointer"
                onClick={() => onSelectRegistro(reg)}
              >
                <div className="flex items-center">
                  <Clock size={14} className="text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {reg.empleadoNombre}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {reg.horaEntrada || '—'} - {reg.horaSalida || '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroCalendario;