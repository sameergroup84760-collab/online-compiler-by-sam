require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JUDGE0_URL = (process.env.JUDGE0_URL || 'https://ce.judge0.com').replace(/\/$/, '');

app.use(express.json({ limit: '256kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const languageMap = {
  c: { id: 50, name: 'C (GCC 9.2.0)' },
  cpp: { id: 54, name: 'C++ (GCC 9.2.0)' },
  python: { id: 71, name: 'Python (3.8.1)' },
  java: { id: 62, name: 'Java (OpenJDK 13.0.1)' },
  sql: { id: 82, name: 'SQL (SQLite 3.27.2)' },
  php: { id: 68, name: 'PHP (7.4.1)' }
};

function judgeHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (process.env.JUDGE0_API_KEY) h['X-Auth-Token'] = process.env.JUDGE0_API_KEY;
  if (process.env.JUDGE0_API_HOST) h['X-RapidAPI-Host'] = process.env.JUDGE0_API_HOST;
  if (process.env.JUDGE0_API_KEY && process.env.JUDGE0_API_HOST) h['X-RapidAPI-Key'] = process.env.JUDGE0_API_KEY;
  return h;
}

app.get('/api/languages', (_req, res) => res.json(languageMap));

app.post('/api/run', async (req, res) => {
  try {
    const { language, source_code, stdin = '' } = req.body || {};
    if (!languageMap[language]) return res.status(400).json({ error: 'Unsupported language.' });
    if (typeof source_code !== 'string' || !source_code.trim()) return res.status(400).json({ error: 'Code cannot be empty.' });
    if (source_code.length > 100000) return res.status(413).json({ error: 'Code is too large.' });
    if (String(stdin).length > 20000) return res.status(413).json({ error: 'Input is too large.' });

    const body = {
      language_id: languageMap[language].id,
      source_code,
      stdin: String(stdin),
      cpu_time_limit: 3,
      wall_time_limit: 5,
      memory_limit: 128000
    };

    const create = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST', headers: judgeHeaders(), body: JSON.stringify(body)
    });
    if (!create.ok) {
      const text = await create.text();
      return res.status(create.status).json({ error: `Execution service error: ${text.slice(0, 500)}` });
    }
    const { token } = await create.json();
    if (!token) return res.status(502).json({ error: 'Execution service did not return a token.' });

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 500));
      const result = await fetch(`${JUDGE0_URL}/submissions/${encodeURIComponent(token)}?base64_encoded=false`, { headers: judgeHeaders() });
      if (!result.ok) continue;
      const data = await result.json();
      if (data.status && ![1,2].includes(data.status.id)) return res.json(data);
    }
    return res.json({ status: { id: 5, description: 'Time limit / polling timeout' }, stdout: '', stderr: 'The execution service took too long to respond.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Check your Judge0 configuration.' });
  }
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`CodeRunner running at http://localhost:${PORT}`));
