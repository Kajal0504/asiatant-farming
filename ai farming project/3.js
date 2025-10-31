const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('.'));

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set in .env');
}

app.post('/api/ask', async (req, res) => {
  const { question, context = 'general' } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  const systemPrompt = `You are an expert farming assistant. Answer concisely with practical, actionable advice for smallholders. Context: ${context}.`;

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: 400,
        temperature: 0.2
      })
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(502).json({ error: 'Upstream error', details: txt });
    }

    const payload = await r.json();
    const answer = payload.choices?.[0]?.message?.content?.trim() ?? '';
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));