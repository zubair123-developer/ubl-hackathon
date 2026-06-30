const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Add a transaction
router.post('/add', async (req, res) => {
    try {
        const { user_id, amount, category, merchant, description, date } = req.body;

        const { data, error } = await supabase
            .from('transactions')
            .insert([{ user_id, amount, category, merchant, description, date }])
            .select();

        if (error) throw error;

        res.status(201).json({
            status: 'success',
            message: 'Transaction added',
            transaction: data[0]
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get all transactions for a user
router.get('/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user_id)
            .order('date', { ascending: false });

        if (error) throw error;

        res.json({
            status: 'success',
            count: data.length,
            transactions: data
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get spending summary by category
router.get('/:user_id/summary', async (req, res) => {
    try {
        const { user_id } = req.params;

        const { data, error } = await supabase
            .from('transactions')
            .select('category, amount')
            .eq('user_id', user_id);

        if (error) throw error;

        // Group by category
        const summary = data.reduce((acc, transaction) => {
            const category = transaction.category || 'Other';
            acc[category] = (acc[category] || 0) + parseFloat(transaction.amount);
            return acc;
        }, {});

        res.json({
            status: 'success',
            summary
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;