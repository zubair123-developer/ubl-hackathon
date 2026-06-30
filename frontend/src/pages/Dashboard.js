import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import StatCard from '../components/StatCard';
import MonthlyChart from '../components/MonthlyChart';
import CategoryChart from '../components/CategoryChart';
import RecentTransactions from '../components/RecentTransactions';
import './Dashboard.css';

const API = 'http://localhost:4000';

function greet() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Dashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [txns,    setTxns]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/transactions/3`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load transactions');
        const data = await res.json();
        setTxns(Array.isArray(data) ? data : data.transactions || []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [token]);

  /* ── Derived KPIs ── */
  const income   = txns.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0);
  const balance  = income - expenses;
  const savePct  = income > 0 ? Math.round((balance / income) * 100) : 0;
  const firstName = (user?.name || user?.email || 'there').split(' ')[0];

  if (loading) return (
    <div className="dash-loading">
      <span className="spin" />
    </div>
  );

  if (error) return (
    <div className="dash-loading">
      <p style={{ color: 'var(--red)', fontSize: 14 }}>{error}</p>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">{greet()}, {firstName}</h1>
          <p className="dash-sub">Here's your financial overview</p>
        </div>
        <button className="dash-cta" onClick={() => navigate('/transactions')}>
          + Add transaction
        </button>
      </div>

      <div className="kpi-row">
        <StatCard label="Net balance"   value={balance}  type="balance"  hint={savePct + '% savings rate'} />
        <StatCard label="Total income"  value={income}   type="income" />
        <StatCard label="Total expenses" value={expenses} type="expense" />
        <StatCard label="Transactions"  value={txns.length} type="count" />
      </div>

      <div className="charts-row">
        <MonthlyChart transactions={txns} />
        <CategoryChart transactions={txns} />
      </div>

      <RecentTransactions transactions={txns} limit={6} />
    </div>
  );
}