import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid,
} from 'recharts';
import './MonthlyChart.css';

function buildMonthlyData(txns) {
  const map = {};
  txns.forEach(t => {
    const d = new Date(t.date || t.created_at);
    if (isNaN(d)) return;
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!map[key]) map[key] = { month: key, income: 0, expenses: 0, _ts: d.getTime() };
    if (t.type === 'income')  map[key].income   += +t.amount;
    else                       map[key].expenses += +t.amount;
  });
  return Object.values(map)
    .sort((a, b) => a._ts - b._ts)
    .slice(-6)
    .map(({ _ts, ...rest }) => rest);
}

const fmt = v => `PKR ${(v / 1000).toFixed(0)}k`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <p className="tip-month">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill }}>
          {p.name}: PKR {Math.round(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function MonthlyChart({ transactions }) {
  const data = buildMonthlyData(transactions);

  return (
    <div className="chart-panel">
      <p className="chart-panel-title">Monthly breakdown</p>
      {data.length === 0 ? (
        <div className="chart-empty">Add transactions to see your monthly trend</div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={data} barSize={9} barGap={3}
            margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border-dim)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 11 }}
              axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fill: 'var(--text-3)', fontSize: 11 }}
              axisLine={false} tickLine={false} width={44} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
            <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-2)', paddingTop: 10 }} />
            <Bar dataKey="income"   name="Income"   fill="#22c55e" radius={[3,3,0,0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}