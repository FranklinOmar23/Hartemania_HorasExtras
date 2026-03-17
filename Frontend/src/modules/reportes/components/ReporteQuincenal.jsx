import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, Badge } from '../../../components/common';
import { formatearMoneda, formatearHoras } from '../../../utils';

// ============================================
// COMPONENTE REPORTE QUINCENAL
// Visualización de reporte quincenal
// ============================================

const ReporteQuincenal = ({ data, fullPage = false }) => {
  if (!data) return null;

  const { resumen, empleados } = data;

  // ========================================
  // DATOS PARA GRÁFICO
  // ========================================
  const chartData = [
    { name: '35%', horas: resumen.horasPorTipo.he35, monto: resumen.montosPorTipo.he35 },
    { name: '100%', horas: resumen.horasPorTipo.he100, monto: resumen.montosPorTipo.he100 },
    { name: '15%', horas: resumen.horasPorTipo.he15, monto: resumen.montosPorTipo.he15 },
    { name: 'Feriado', horas: resumen.horasPorTipo.feriado, monto: resumen.montosPorTipo.feriado }
  ];

  // ========================================
  // COLUMNAS DE LA TABLA
  // ========================================
  const columns = [
    {
      key: 'codigo',
      label: 'Código',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'nombre',
      label: 'Empleado',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{row.codigo}</p>
        </div>
      )
    },
    {
      key: 'horas35',
      label: 'HE 35%',
      render: (value) => (
        <div>
          <span className="font-medium">{formatearHoras(value || 0)}</span>
          <span className="text-xs text-gray-500 ml-1">hrs</span>
        </div>
      )
    },
    {
      key: 'horas100',
      label: 'HE 100%',
      render: (value) => (
        <div>
          <span className="font-medium">{formatearHoras(value || 0)}</span>
          <span className="text-xs text-gray-500 ml-1">hrs</span>
        </div>
      )
    },
    {
      key: 'horas15',
      label: 'HE 15%',
      render: (value) => (
        <div>
          <span className="font-medium">{formatearHoras(value || 0)}</span>
          <span className="text-xs text-gray-500 ml-1">hrs</span>
        </div>
      )
    },
    {
      key: 'totalHoras',
      label: 'Total Horas',
      render: (value) => (
        <span className="font-bold">{formatearHoras(value || 0)}</span>
      )
    },
    {
      key: 'totalPagar',
      label: 'Total a Pagar',
      render: (value) => (
        <span className="font-bold text-green-600">
          {formatearMoneda(value || 0)}
        </span>
      )
    }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={`space-y-8 ${fullPage ? '' : 'max-h-96 overflow-y-auto'}`}>
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 mb-1">Total Empleados</p>
          <p className="text-2xl font-bold text-gray-900">{resumen.totalEmpleados}</p>
          <p className="text-xs text-blue-500 mt-1">
            {resumen.empleadosConHE} con HE
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 mb-1">Total Horas</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatearHoras(resumen.totalHoras)}
          </p>
          <p className="text-xs text-green-500 mt-1">hrs</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 mb-1">Total a Pagar</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatearMoneda(resumen.totalPagar)}
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600 mb-1">Promedio x Empleado</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatearMoneda(resumen.totalPagar / resumen.empleadosConHE)}
          </p>
        </div>
      </div>

      {/* Gráfico de distribución */}
      {!fullPage && (
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="horas" name="Horas" fill="#3B82F6" />
              <Bar yAxisId="right" dataKey="monto" name="Monto" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla de detalle */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Detalle por Empleado
        </h3>
        <Table
          columns={columns}
          data={empleados}
          loading={false}
          emptyMessage="No hay datos para mostrar"
        />
      </div>
    </div>
  );
};

export default ReporteQuincenal;