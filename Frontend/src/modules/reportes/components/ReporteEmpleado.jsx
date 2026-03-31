import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, Badge } from '../../../components/common';
import { formatearMoneda, formatearFecha, formatearHoras } from '../../../utils';

// ============================================
// COMPONENTE REPORTE EMPLEADO
// Reporte individual por empleado
// ============================================

const ReporteEmpleado = ({ data, fullPage = false }) => {
  if (!data) return null;

  const { empleado, resumen, registros = [] } = data;

  // ========================================
  // DATOS PARA GRÁFICO
  // ========================================
  const chartData = registros.map(reg => ({
    fecha: formatearFecha(reg.fecha, 'dd/MM'),
    horas: reg.totalHoras,
    monto: reg.monto
  }));

  // ========================================
  // COLUMNAS DE LA TABLA
  // ========================================
  const columns = [
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value) => formatearFecha(value)
    },
    {
      key: 'entrada',
      label: 'Entrada',
      render: (value) => value || '—'
    },
    {
      key: 'salida',
      label: 'Salida',
      render: (value) => value || '—'
    },
    {
      key: 'horas35',
      label: 'HE 35%',
      render: (value) => formatearHoras(value || 0)
    },
    {
      key: 'horas100',
      label: 'HE 100%',
      render: (value) => formatearHoras(value || 0)
    },
    {
      key: 'horas15',
      label: 'HE 15%',
      render: (value) => formatearHoras(value || 0)
    },
    {
      key: 'totalHoras',
      label: 'Total',
      render: (value) => (
        <span className="font-medium">{formatearHoras(value || 0)}</span>
      )
    },
    {
      key: 'monto',
      label: 'Monto',
      render: (value) => (
        <span className="font-medium text-green-600">
          {formatearMoneda(value || 0)}
        </span>
      )
    }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={`space-y-8 ${fullPage ? '' : 'max-h-96 overflow-y-auto pr-1'}`}>
      {/* Información del empleado */}
      <div className="rounded-[28px] border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-emerald-50 p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Código</p>
            <p className="text-lg font-semibold text-gray-900">{empleado.codigo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="text-lg font-semibold text-gray-900">{empleado.nombre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Posición</p>
            <p className="text-lg font-semibold text-gray-900">{empleado.posicion}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Departamento</p>
            <p className="text-lg font-semibold text-gray-900">{empleado.departamento}</p>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-5">
          <p className="text-sm text-blue-600 mb-1">Total Horas</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatearHoras(resumen.totalHoras)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5">
          <p className="text-sm text-green-600 mb-1">Total a Pagar</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatearMoneda(resumen.totalPagar)}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-5">
          <p className="text-sm text-purple-600 mb-1">Días trabajados</p>
          <p className="text-2xl font-bold text-gray-900">
            {registros.length}
          </p>
        </div>
      </div>

      {/* Gráfico de tendencia */}
      {!fullPage && chartData.length > 0 && (
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm" style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="fecha" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="horas" name="Horas" stroke="#3B82F6" />
              <Line yAxisId="right" type="monotone" dataKey="monto" name="Monto" stroke="#10B981" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Desglose por tipo */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-blue-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xs text-blue-600">HE 35%</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatearHoras(resumen.horasPorTipo.he35)}
          </p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xs text-green-600">HE 100%</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatearHoras(resumen.horasPorTipo.he100)}
          </p>
        </div>
        <div className="rounded-2xl border border-yellow-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xs text-yellow-600">HE 15%</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatearHoras(resumen.horasPorTipo.he15)}
          </p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xs text-red-600">Feriado</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatearHoras(resumen.horasPorTipo.feriado || 0)}
          </p>
        </div>
      </div>

      {/* Tabla de registros */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Registros Diarios
        </h3>
        <Table
          columns={columns}
          data={registros}
          loading={false}
          emptyMessage="No hay registros para este período"
        />
      </div>

      {/* Totales */}
      <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
        <span className="font-medium text-gray-700">Total general</span>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatearHoras(resumen.totalHoras)} hrs
          </p>
          <p className="text-sm font-medium text-green-600">
            {formatearMoneda(resumen.totalPagar)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReporteEmpleado;