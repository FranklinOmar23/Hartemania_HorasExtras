import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector
} from 'recharts';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

// ============================================
// COMPONENTE PIECHART
// Gráfico de pastel reutilizable
// ============================================

const PieChart = ({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  title,
  subtitle,
  loading = false,
  height = 400,
  innerRadius = 0, // 0 = pastel, >0 = donut
  outerRadius = '80%',
  showTooltip = true,
  showLegend = true,
  showLabels = false,
  tooltipFormatter,
  legendFormatter,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'],
  className = '',
  onSliceClick,
  activeIndex,
  emptyMessage = 'No hay datos para mostrar'
}) => {
  const [activeSlice, setActiveSlice] = React.useState(activeIndex);

  // ========================================
  // RENDER ACTIVE SHAPE (para efecto hover)
  // ========================================
  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>
          {payload[nameKey]} : {value.toFixed(2)}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize={11}>
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

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
          <RechartsPieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              label={showLabels}
              activeIndex={activeSlice}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveSlice(index)}
              onMouseLeave={() => setActiveSlice(undefined)}
              onClick={(data) => onSliceClick?.(data)}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            
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
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// ============================================
// VARIANTES ESPECÍFICAS
// ============================================

export const DistribucionHorasPieChart = ({ data, loading, title = 'Distribución de Horas Extras' }) => {
  const tooltipFormatter = (value, name) => {
    return [`${value.toFixed(2)} hrs`, name];
  };

  return (
    <PieChart
      data={data}
      dataKey="horas"
      nameKey="tipo"
      title={title}
      loading={loading}
      tooltipFormatter={tooltipFormatter}
    />
  );
};

export const DistribucionMontosPieChart = ({ data, loading, title = 'Distribución de Montos a Pagar' }) => {
  const tooltipFormatter = (value, name) => {
    return [`RD$ ${value.toFixed(2)}`, name];
  };

  return (
    <PieChart
      data={data}
      dataKey="monto"
      nameKey="tipo"
      title={title}
      loading={loading}
      tooltipFormatter={tooltipFormatter}
    />
  );
};

export const DonutChart = ({ data, loading, title = 'Progreso' }) => {
  return (
    <PieChart
      data={data}
      dataKey="value"
      nameKey="name"
      title={title}
      loading={loading}
      innerRadius="60%"
    />
  );
};

export default PieChart;