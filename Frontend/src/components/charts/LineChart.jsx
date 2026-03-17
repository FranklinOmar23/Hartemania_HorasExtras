import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

// ============================================
// COMPONENTE LINECHART
// Gráfico de líneas reutilizable
// ============================================

const LineChart = ({
  data = [],
  xAxisKey = 'name',
  lines = [
    { key: 'value', name: 'Valor', color: '#3B82F6' }
  ],
  title,
  subtitle,
  loading = false,
  height = 400,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  showDots = true,
  showXAxis = true,
  showYAxis = true,
  tooltipFormatter,
  xAxisFormatter,
  yAxisFormatter,
  legendFormatter,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  className = '',
  onLineClick,
  emptyMessage = 'No hay datos para mostrar'
}) => {
  // ========================================
  // CONFIGURACIÓN DE LÍNEAS
  // ========================================
  const getLineColor = (index) => colors[index % colors.length];

  // ========================================
  // RENDER
  // ========================================
  if (loading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center" style={{ height }}>
          <Spinner />
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={title}
      subtitle={subtitle}
      className={className}
    >
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsLineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onClick={(e) => onLineClick?.(e)}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
            
            {showXAxis && (
              <XAxis
                dataKey={xAxisKey}
                tickFormatter={xAxisFormatter}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
            )}
            
            {showYAxis && (
              <YAxis
                tickFormatter={yAxisFormatter}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
            )}
            
            {showTooltip && (
              <Tooltip
                formatter={tooltipFormatter}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.375rem',
                  padding: '0.5rem'
                }}
              />
            )}
            
            {showLegend && (
              <Legend
                formatter={legendFormatter}
                wrapperStyle={{ paddingTop: '1rem' }}
              />
            )}

            {lines.map((line, index) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name || line.key}
                stroke={line.color || getLineColor(index)}
                strokeWidth={2}
                dot={showDots}
                activeDot={{ r: 8 }}
                onClick={(data) => line.onClick?.(data)}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// ============================================
// VARIANTES ESPECÍFICAS
// ============================================

export const TendenciaLineChart = ({ data, loading, title = 'Tendencia de Horas Extras' }) => {
  const lines = [
    { key: 'horas35', name: '35%', color: '#3B82F6' },
    { key: 'horas100', name: '100%', color: '#10B981' },
    { key: 'horas15', name: '15%', color: '#F59E0B' },
    { key: 'total', name: 'Total', color: '#6B7280' }
  ];

  const tooltipFormatter = (value, name) => {
    return [`${value.toFixed(2)} hrs`, name];
  };

  return (
    <LineChart
      data={data}
      lines={lines}
      title={title}
      loading={loading}
      tooltipFormatter={tooltipFormatter}
      yAxisFormatter={(value) => `${value} hrs`}
    />
  );
};

export const AcumuladoLineChart = ({ data, loading, title = 'Horas Extras Acumuladas' }) => {
  const lines = [
    { key: 'acumulado', name: 'Acumulado', color: '#3B82F6' }
  ];

  const tooltipFormatter = (value, name) => {
    return [`${value.toFixed(2)} hrs`, 'Acumulado'];
  };

  return (
    <LineChart
      data={data}
      lines={lines}
      title={title}
      loading={loading}
      tooltipFormatter={tooltipFormatter}
      yAxisFormatter={(value) => `${value} hrs`}
      showDots={false}
    />
  );
};

export const LimiteLegalLineChart = ({ data, loading, title = 'Límite Legal vs Real' }) => {
  const lines = [
    { key: 'real', name: 'Horas Reales', color: '#3B82F6' },
    { key: 'limite', name: 'Límite Legal', color: '#EF4444', strokeDasharray: '5 5' }
  ];

  const tooltipFormatter = (value, name) => {
    return [`${value.toFixed(2)} hrs`, name];
  };

  return (
    <LineChart
      data={data}
      lines={lines}
      title={title}
      loading={loading}
      tooltipFormatter={tooltipFormatter}
      yAxisFormatter={(value) => `${value} hrs`}
    />
  );
};

export default LineChart;