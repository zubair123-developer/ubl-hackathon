import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:4000';
const USER_ID = 3;

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/transactions/3`);
const data = response.data;
setTransactions(Array.isArray(data) ? data : data.transactions || []);
    } catch (error) {
      console.error("Error pulling ledger history:", error);
      // Fallback fallback arrays for immediate display/testing
      setTransactions([
        { id: 1, description: 'Salary Credit', amount: 150000, category: 'Salary', type: 'income', date: '2026-06-01' },
        { id: 2, description: 'Office Grocery', amount: 12000, category: 'Food', type: 'expense', date: '2026-06-05' },
        { id: 3, description: 'Electricity Bill', amount: 25000, category: 'Utilities', type: 'expense', date: '2026-06-10' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Submit form handler
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!description || !amount) return alert('Please input item descriptions and accurate pricing numbers.');

    setFormSubmitting(true);
    const newPayload = {
      userId: USER_ID,
      description,
      amount: parseFloat(amount),
      category,
      type,
      date
    };

    try {
      // Post to Node.js backend running on port 4000
     await axios.post(`${BASE_URL}/transactions/add`, newPayload);
      
      // Clear form inputs
      setDescription('');
      setAmount('');
      
      // Refresh list live
      await fetchTransactions();
    } catch (error) {
      console.error("Failed submitting tracking record:", error);
      // Fallback mutation for visual demo purposes
      setTransactions(prev => [
        { id: Date.now(), ...newPayload },
        ...prev
      ]);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700' }}>Transactions Book</h2>
        <p style={{ color: '#9CA3AF', marginTop: '4px' }}>Log new entries or inspect your immutable ledger historical entries.</p>
      </header>

      <div style={styles.layoutGrid}>
        {/* 📥 Entry Form Component */}
        <div style={styles.panel}>
          <h4 style={styles.panelTitle}>Log Transaction</h4>
          <form onSubmit={handleAddTransaction} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <input
                type="text"
                placeholder="e.g., Cloud Server Subscription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Amount (Rs.)</label>
                <input
                  type="number"
                  placeholder="2500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Log Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} style={styles.select}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
                  <option value="Salary">Salary</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Food">Food</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" style={styles.submitBtn} disabled={formSubmitting}>
              {formSubmitting ? 'Writing to Ledger...' : 'Insert Record'}
            </button>
          </form>
        </div>

        {/* 📑 Tabular Audit Table Component */}
        <div style={{ ...styles.panel, flex: 2 }}>
          <h4 style={styles.panelTitle}>Complete Ledger History</h4>
          {loading ? (
            <p style={{ color: '#38BDF8' }}>Updating database references...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Details</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} style={styles.tr}>
                      <td style={styles.td}>{tx.description}</td>
                      <td style={styles.td}><span style={styles.tag}>{tx.category}</span></td>
                      <td style={styles.td}>{tx.date}</td>
                      <td style={{ ...styles.td, fontWeight: '600', color: tx.type === 'income' ? '#34D399' : '#F87171' }}>
                        {tx.type === 'income' ? '+' : '-'} Rs. {Math.abs(tx.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  layoutGrid: {
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  panel: {
    backgroundColor: '#111827',
    border: '1px solid #1F2937',
    borderRadius: '12px',
    padding: '24px',
    flex: '1',
    minWidth: '320px'
  },
  panelTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow: {
    display: 'flex',
    gap: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  label: {
    fontSize: '12px',
    color: '#9CA3AF',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0B0F19',
    border: '1px solid #1F2937',
    borderRadius: '6px',
    padding: '10px 12px',
    color: '#FFF',
    fontSize: '14px',
    outline: 'none',
  },
  select: {
    backgroundColor: '#0B0F19',
    border: '1px solid #1F2937',
    borderRadius: '6px',
    padding: '10px 12px',
    color: '#FFF',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#34D399',
    color: '#0B0F19',
    border: 'none',
    borderRadius: '6px',
    padding: '12px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '1px solid #1F2937',
  },
  th: {
    color: '#9CA3AF',
    fontWeight: '500',
    fontSize: '13px',
    paddingBottom: '12px',
  },
  tr: {
    borderBottom: '1px solid #1F2937',
  },
  td: {
    padding: '12px 0',
    fontSize: '14px',
    color: '#E5E7EB',
  },
  tag: {
    backgroundColor: '#1E293B',
    color: '#38BDF8',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
  }
};

export default Transactions;