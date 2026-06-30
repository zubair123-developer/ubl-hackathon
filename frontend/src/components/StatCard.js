import './StatCard.css';

const pkr = n => 'PKR ' + Math.abs(Math.round(n)).toLocaleString('en-PK');

export default function StatCard({ label, value, type, hint }) {
  const isCount   = type === 'count';
  const isBalance = type === 'balance';
  const isIncome  = type === 'income';

  const display = isCount ? String(value) : pkr(value);
  const colorCls = isBalance
    ? (value >= 0 ? 'green' : 'red')
    : isIncome ? 'green' : type === 'expense' ? 'red' : 'blue';

  return (
    <div className={`stat-card ${isBalance ? 'stat-accent' : ''}`}>
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${colorCls}`}>{display}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  );
}