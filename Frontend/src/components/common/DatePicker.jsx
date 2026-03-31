import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import Input from './Input';

// ============================================
// COMPONENTE DATEPICKER
// Selector de fechas con calendario
// ============================================

const DatePicker = ({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  label,
  error,
  disabled = false,
  minDate,
  maxDate,
  format: dateFormat = 'dd/MM/yyyy',
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const [inputValue, setInputValue] = useState(value ? format(value, dateFormat) : '');
  const [calendarPosition, setCalendarPosition] = useState('left');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setInputValue(format(value, dateFormat));
      setCurrentMonth(new Date(value));
    } else {
      setInputValue('');
    }
  }, [value, dateFormat]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const updateCalendarPosition = () => {
      const bounds = containerRef.current.getBoundingClientRect();
      const estimatedCalendarWidth = Math.min(window.innerWidth * 0.9, window.innerWidth >= 640 ? 320 : 288);

      if (bounds.left + estimatedCalendarWidth > window.innerWidth - 16) {
        setCalendarPosition('right');
        return;
      }

      setCalendarPosition('left');
    };

    updateCalendarPosition();
    window.addEventListener('resize', updateCalendarPosition);

    return () => window.removeEventListener('resize', updateCalendarPosition);
  }, [isOpen]);

  // ========================================
  // FUNCIONES DEL CALENDARIO
  // ========================================
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateSelect = (date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    // Intentar parsear la fecha
    try {
      const parsedDate = parse(val, dateFormat, new Date());
      if (!isNaN(parsedDate)) {
        onChange(parsedDate);
      }
    } catch {
      // Fecha inválida, no hacer nada
    }
  };

  const clearDate = () => {
    onChange(null);
    setInputValue('');
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        icon={Calendar}
        iconPosition="left"
        onFocus={() => setIsOpen(true)}
        className={className}
        {...props}
      />

      {/* Calendario */}
      {isOpen && !disabled && (
        <div
          className={`absolute z-50 mt-1 w-[min(90vw,18rem)] rounded-2xl border border-gray-200 bg-white p-3 shadow-lg sm:w-80 sm:p-4 ${
            calendarPosition === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Header del calendario */}
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-center text-sm font-medium sm:text-base">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((day) => (
              <div key={day} className="text-center text-[11px] font-medium text-gray-500 sm:text-xs">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((date) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = value && isSameDay(date, value);
              const isToday_ = isToday(date);
              const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);

              return (
                <button
                  key={date.toString()}
                  type="button"
                  onClick={() => !isDisabled && handleDateSelect(date)}
                  disabled={isDisabled || !isCurrentMonth}
                  className={`
                    flex h-9 items-center justify-center rounded-full text-sm transition-colors sm:h-10
                    ${!isCurrentMonth && 'text-gray-300'}
                    ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100'}
                    ${isToday_ && !isSelected && 'border border-blue-300'}
                    ${isDisabled && 'opacity-50 cursor-not-allowed'}
                  `}
                >
                  {format(date, 'd')}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
            <button
              type="button"
              onClick={() => handleDateSelect(new Date())}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Hoy
            </button>
            {value && (
              <button
                type="button"
                onClick={clearDate}
                className="text-sm text-red-600 hover:text-red-800 flex items-center"
              >
                <X size={14} className="mr-1" />
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// RANGEPICKER
// Selector de rango de fechas
// ============================================
export const RangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  labelStart = 'Fecha inicio',
  labelEnd = 'Fecha fin',
  ...props
}) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <DatePicker
        label={labelStart}
        value={startDate}
        onChange={onStartDateChange}
        maxDate={endDate}
        {...props}
      />
      <DatePicker
        label={labelEnd}
        value={endDate}
        onChange={onEndDateChange}
        minDate={startDate}
        {...props}
      />
    </div>
  );
};

export default DatePicker;