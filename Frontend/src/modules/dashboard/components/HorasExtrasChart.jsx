import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, Spinner } from '../../../components/common';
import { formatearHoras } from '../../../utils';

// ============================================
// COMPONENTE HORAS EXTRAS CHART
// Gráficos de distribución de horas extras
// ============================================

const HorasExtrasChart = ({ data, loading, tieneQuincenas }) => {
  const [activeTab, setActiveTab] = useState('barras');

  const barData = (data?.porDia || []).map((item) => ({
    ...item,
    he35: item.he35 ?? item['35%'] ?? item['HE 35%'] ?? 0,
    he100: item.he100 ?? item['100%'] ?? item['HE 100%'] ?? 0,
    he15: item.he15 ?? item['15%'] ?? item['HE 15%'] ?? 0,
    feriado: item.feriado ?? item['Feriado'] ?? item.heFeriado ?? 0
  }));
  const pieData = data?.porTipo || [];
  const hasPieData = pieData.some(item => item.value > 0);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center text-xs mb-1">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 mr-2">{entry.name}:</span>
              <span className="font-medium">{tieneQuincenas ? formatearHoras(entry.value) : entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-xs text-gray-600 mt-1">
            Horas: {formatearHoras(payload[0].value)}
          </p>
          <p className="text-xs text-gray-600">
            Porcentaje: {((payload[0].value / (pieData.reduce((a, b) => a + b.value, 0) || 1)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // ========================================
  // RENDER
  // ========================================
  if (loading) {
    return (
      <Card title="Distribución de Horas Extras">
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      </Card>
    );
  }

  const tabs = [
    { id: 'barras', label: tieneQuincenas ? 'Horas por Dia' : 'Registros por Dia' },
    ...(hasPieData ? [{ id: 'pastel', label: 'Por Tipo' }] : [])
  ];

  return (
    <Card title={tieneQuincenas ? 'Distribucion de Horas Extras' : 'Actividad de Registros'}>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Grafico de barras */}
      {activeTab === 'barras' && (
        <div style={{ width: '100%', height: 300 }}>
          {barData.length > 0 ? (
            <ResponsiveContainer>
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="dia" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={tieneQuincenas ? (v) => `${v} hrs` : undefined}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {tieneQuincenas ? (
                  <>
                    <Bar dataKey="he35" stackId="a" fill="#3B82F6" name="35%" />
                    <Bar dataKey="he100" stackId="a" fill="#10B981" name="100%" />
                    <Bar dataKey="he15" stackId="a" fill="#F59E0B" name="15%" />
                    <Bar dataKey="feriado" stackId="a" fill="#EF4444" name="Feriado" />
                  </>
                ) : (
                  <>
                    <Bar dataKey="Registros" fill="#3B82F6" name="Registros" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Empleados" fill="#10B981" name="Empleados" radius={[4, 4, 0, 0]} />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No hay datos para mostrar
            </div>
          )}
        </div>
      )}

      {/* Grafico de pastel */}
      {activeTab === 'pastel' && hasPieData && (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
        {tieneQuincenas ? (
          <>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
              <span className="text-xs text-gray-600">35%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <span className="text-xs text-gray-600">100%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
              <span className="text-xs text-gray-600">15%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
              <span className="text-xs text-gray-600">Feriado</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
              <span className="text-xs text-gray-600">Registros</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <span className="text-xs text-gray-600">Empleados</span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default HorasExtrasChart;