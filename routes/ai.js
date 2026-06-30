const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const supabase = require('../config/supabase');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/advice', async (req, res) => {
    try {
        const { user_id, question } = req.body;

        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user_id)
            .order('date', { ascending: false })
            .limit(20);

        if (error) throw error;

        const transactionText = transactions.map(t =>
            `${t.date}: ${t.category} - ${t.merchant} - PKR ${t.amount}`
        ).join('\n');

        const prompt = `You are a helpful financial advisor for Pakistani users.
        
Here are the user's recent transactions:
${transactionText}

User question: ${question}

Give practical, specific financial advice in simple English based on these transactions. Keep it under 150 words.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
        });

        const advice = completion.choices[0].message.content;

        res.json({
            status: 'success',
            question,
            advice
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;