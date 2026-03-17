import React, { useState } from 'react';  // ← IMPORTAR useState
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
import { Card, Spinner, Tabs } from '../../../components/common';
import { formatearHoras } from '../../../utils';

// ============================================
// COMPONENTE HORAS EXTRAS CHART
// Gráficos de distribución de horas extras
// ============================================

const HorasExtrasChart = ({ data, loading }) => {
  const [activeTab, setActiveTab] = useState('barras');  // ← AHORA SÍ FUNCIONA

  // ========================================
  // DATOS PARA GRÁFICOS
  // ========================================
  const barData = data?.porDia || [];
  const pieData = data?.porTipo || [
    { name: '35%', value: 0, color: '#3B82F6' },
    { name: '100%', value: 0, color: '#10B981' },
    { name: '15%', value: 0, color: '#F59E0B' },
    { name: 'Feriado', value: 0, color: '#EF4444' }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  // ========================================
  // CUSTOM TOOLTIP
  // ========================================
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
              <span className="font-medium">{formatearHoras(entry.value)}</span>
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
    { id: 'barras', label: 'Por Día' },
    { id: 'pastel', label: 'Por Tipo' }
  ];

  return (
    <Card title="Distribución de Horas Extras">
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

      {/* Gráfico de barras */}
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
                  tickFormatter={(value) => `${value} hrs`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="35%" stackId="a" fill="#3B82F6" name="35%" />
                <Bar dataKey="100%" stackId="a" fill="#10B981" name="100%" />
                <Bar dataKey="15%" stackId="a" fill="#F59E0B" name="15%" />
                <Bar dataKey="feriado" stackId="a" fill="#EF4444" name="Feriado" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No hay datos para mostrar
            </div>
          )}
        </div>
      )}

      {/* Gráfico de pastel */}
      {activeTab === 'pastel' && (
        <div style={{ width: '100%', height: 300 }}>
          {pieData.some(item => item.value > 0) ? (
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
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No hay datos para mostrar
            </div>
          )}
        </div>
      )}

      {/* Leyenda de colores */}
      <div className="flex justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
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
      </div>
    </Card>
  );
};

export default HorasExtrasChart;