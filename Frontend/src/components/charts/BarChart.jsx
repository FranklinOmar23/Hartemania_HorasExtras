import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

// ============================================
// COMPONENTE BARCHART
// Gráfico de barras reutilizable
// ============================================

const BarChart = ({
  data = [],
  xAxisKey = 'name',
  bars = [
    { key: 'value', name: 'Valor', color: '#3B82F6' }
  ],
  title,
  subtitle,
  loading = false,
  height = 400,
  layout = 'horizontal', // horizontal, vertical
  stacked = false,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  tooltipFormatter,
  xAxisFormatter,
  yAxisFormatter,
  legendFormatter,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  className = '',
  onBarClick,
  emptyMessage = 'No hay datos para mostrar'
}) => {
  // ========================================
  // CONFIGURACIÓN DE BARRAS
  // ========================================
  const getBarColor = (index) => colors[index % colors.length];

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
          <RechartsBarChart
            data={data}
            layout={layout}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onClick={(e) => onBarClick?.(e)}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
            
            {showXAxis && (
              <XAxis
                dataKey={xAxisKey}
                tickFormatter={xAxisFormatter}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
                type={layout === 'vertical' ? 'number' : 'category'}
              />
            )}
            
            {showYAxis && (
              <YAxis
                tickFormatter={yAxisFormatter}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
                type={layout === 'vertical' ? 'category' : 'number'}
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

            {bars.map((bar, index) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                name={bar.name || bar.key}
                fill={bar.color || getBarColor(index)}
                stackId={stacked ? 'stack' : undefined}
                onClick={(data) => bar.onClick?.(data)}
                radius={[4, 4, 0, 0]}
              >
                {bar.data?.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={bar.colors?.[i] || bar.color || getBarColor(i)} />
                ))}
              </Bar>
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// ============================================
// VARIANTES ESPECÍFICAS
// ============================================

export const HorasExtrasBarChart = ({ data, loading, title = 'Horas Extras por Empleado' }) => {
  const bars = [
    { key: 'horas35', name: '35%', color: '#3B82F6' },
    { key: 'horas100', name: '100%', color: '#10B981' },
    { key: 'horas15', name: '15%', color: '#F59E0B' },
    { key: 'horasFeriado', name: 'Feriado', color: '#EF4444' }
  ];

  const tooltipFormatter = (value, name) => {
    return [`${value.toFixed(2)} hrs`, name];
  };

  return (
    <BarChart
      data={data}
      bars={bars}
      title={title}
      loading={loading}
      stacked
      tooltipFormatter={tooltipFormatter}
      yAxisFormatter={(value) => `${value} hrs`}
    />
  );
};

export const MontosBarChart = ({ data, loading, title = 'Montos a Pagar por Empleado' }) => {
  const bars = [
    { key: 'monto35', name: '35%', color: '#3B82F6' },
    { key: 'monto100', name: '100%', color: '#10B981' },
    { key: 'monto15', name: '15%', color: '#F59E0B' },
    { key: 'montoFeriado', name: 'Feriado', color: '#EF4444' }
  ];

  const tooltipFormatter = (value, name) => {
    return [`RD$ ${value.toFixed(2)}`, name];
  };

  const yAxisFormatter = (value) => `RD$ ${value}`;

  return (
    <BarChart
      data={data}
      bars={bars}
      title={title}
      loading={loading}
      stacked
      tooltipFormatter={tooltipFormatter}
      yAxisFormatter={yAxisFormatter}
    />
  );
};

export const ComparativoBarChart = ({ data, loading, title = 'Comparativo de Horas Extras' }) => {
  return (
    <BarChart
      data={data}
      xAxisKey="periodo"
      bars={[
        { key: 'totalHoras', name: 'Total Horas', color: '#3B82F6' }
      ]}
      title={title}
      loading={loading}
      tooltipFormatter={(value) => [`${value.toFixed(2)} hrs`, 'Total']}
    />
  );
};

export default BarChart;