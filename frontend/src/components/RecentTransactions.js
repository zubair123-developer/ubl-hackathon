import './RecentTransactions.css';

const pkr = n => 'PKR ' + Math.round(Math.abs(+n)).toLocaleString('en-PK');

function ArrowUp()   { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>; }
function ArrowDown() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>; }

export default function RecentTransactions({ transactions, limit = 6 }) {
  const sorted = [...transactions]
    .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))
    .slice(0, limit);

  return (
    <div className="rtxn-panel">
      <div className="rtxn-head">
        <p className="chart-panel-title" style={{ margin: 0 }}>Recent transactions</p>
        <span className="rtxn-count">{transactions.length} total</span>
      </div>
      {sorted.length === 0 ? (
        <div className="chart-empty">No transactions yet — add your first one</div>
      ) : (
        <div className="rtxn-list">
          {sorted.map(t => {
            const isIncome = t.type === 'income';
            const d = new Date(t.date || t.created_at);
            const dateStr = isNaN(d) ? '' : d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
            return (
              <div key={t.id} className="rtxn-row">
                <div className={`rtxn-ico ${isIncome ? 'income' : 'expense'}`}>
                  {isIncome ? <ArrowUp /> : <ArrowDown />}
                </div>
                <div className="rtxn-body">
                  <span className="rtxn-desc">{t.description}</span>
                  <div className="rtxn-meta">
                    <span className="rtxn-tag">{t.category || 'Uncategorised'}</span>
                    <span className="rtxn-sep">·</span>
                    <span>{dateStr}</span>
                  </div>
                </div>
                <span className={`rtxn-amt ${isIncome ? 'income' : 'expense'}`}>
                  {isIncome ? '+' : '−'}{pkr(t.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}