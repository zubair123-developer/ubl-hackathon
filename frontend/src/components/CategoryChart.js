import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './CategoryChart.css';

const COLORS = ['#3b82f6','#22c55e','#fbbf24','#f87171','#a78bfa','#34d399'];

function buildPieData(txns) {
  const map = {};
  txns.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || 'Other';
    map[cat] = (map[cat] || 0) + +t.amount;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="chart-tip">
      <p style={{ color: payload[0].payload.fill }}>{name}</p>
      <p>PKR {value.toLocaleString()}</p>
    </div>
  );
};

export default function CategoryChart({ transactions }) {
  const data  = buildPieData(transactions);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="chart-panel">
      <p className="chart-panel-title">Spending by category</p>
      {data.length === 0 ? (
        <div className="chart-empty">No expense data yet</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius={40} outerRadius={62}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {data.map((d, i) => (
              <div key={i} className="pie-row">
                <span className="pie-dot" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="pie-cat">{d.name}</span>
                <span className="pie-pct">
                  {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}