import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import './Transactions.css';

const BASE_URL = 'http://localhost:4000';

const CATEGORIES = [
  'Salary','Freelance','Food','Utilities',
  'Transport','Rent','Shopping','Health','Other'
];

export default function Transactions() {
  const { token } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');

  const [desc,       setDesc]       = useState('');
  const [amount,     setAmount]     = useState('');
  const [category,   setCategory]   = useState('Food');
  const [type,       setType]       = useState('expense');
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formErr,    setFormErr]    = useState('');
  const [showForm,   setShowForm]   = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : data.transactions || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr('');
    if (!desc.trim()) return setFormErr('Description is required.');
    if (!amount || +amount <= 0) return setFormErr('Enter a valid amount.');

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: desc,
          amount: parseFloat(amount),
          category,
          type,
          date,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
      setDesc('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowForm(false);
      await fetchTransactions();
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const displayed = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter);

  const income   = transactions.filter(t => t.type === 'income')
                               .reduce((s, t) => s + +t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense')
                               .reduce((s, t) => s + +t.amount, 0);

  const pkr = n => 'PKR ' + Math.round(Math.abs(n)).toLocaleString();

  return (
    <div className="txn-page">

      <div className="txn-header">
        <div>
          <h1 className="txn-title">Transactions</h1>
          <p className="txn-sub">
            {transactions.length} entries | {pkr(income)} in | {pkr(expenses)} out
          </p>
        </div>
        <button
          className="txn-add-btn"
          onClick={() => { setShowForm(s => !s); setFormErr(''); }}
        >
          {showForm ? 'X Cancel' : '+ Add transaction'}
        </button>
      </div>

      {showForm && (
        <div className="txn-form-card">
          <p className="txn-form-title">New transaction</p>
          <form onSubmit={handleSubmit} className="txn-form" noValidate>
            {formErr && <div className="txn-form-err">{formErr}</div>}

            <div className="txn-field-full">
              <label>Description</label>
              <input
                type="text"
                placeholder="e.g. Monthly salary, Groceries"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>

            <div className="txn-form-row">
              <div className="txn-field">
                <label>Amount (PKR)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div className="txn-field">
                <label>Type</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="txn-field">
                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="txn-field">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="txn-submit-btn" disabled={submitting}>
              {submitting ? <span className="spin" /> : 'Save transaction'}
            </button>
          </form>
        </div>
      )}

      <div className="txn-filters">
        {[
          { key: 'all',     label: 'All' },
          { key: 'income',  label: 'Income' },
          { key: 'expense', label: 'Expenses' },
        ].map(f => (
          <button
            key={f.key}
            className={`txn-pill${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
        <span className="txn-pill-count">{displayed.length} shown</span>
      </div>

      {loading ? (
        <div className="txn-loading"><span className="spin" /></div>
      ) : displayed.length === 0 ? (
        <div className="txn-empty">
          <p>No transactions yet</p>
          <span>Click Add transaction to log your first entry</span>
        </div>
      ) : (
        <div className="txn-table-wrap">
          <table className="txn-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(tx => (
                <tr key={tx.id}>
                  <td className="txn-td-desc">{tx.description}</td>
                  <td>
                    <span className="txn-badge">{tx.category || 'Other'}</span>
                  </td>
                  <td>
                    <span className={`txn-type-badge ${tx.type}`}>
                      {tx.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td className="txn-td-date">
                    {new Date(tx.date || tx.created_at).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className={`txn-td-amount ${tx.type}`} style={{ textAlign: 'right' }}>
                    {tx.type === 'income' ? '+' : '-'}{pkr(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}