require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Verify model name

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to database');
});

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic TEXT UNIQUE,
  count INTEGER DEFAULT 1
)`);

// Middleware ordering is crucial
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));
app.use(bodyParser.json());

// API Endpoints
app.post('/generate', async (req, res) => {
  try {
    const { input, isTopic } = req.body;
    
    if (isTopic) {
      const row = await new Promise((resolve) => {
        db.get('SELECT * FROM questions WHERE topic = ?', [input], (err, row) => resolve(row));
      });

      if (row) {
        db.run('UPDATE questions SET count = count + 1 WHERE topic = ?', [input]);
        return res.json({ question: await generateQuestion(row.topic) });
      }
    }

    const question = isTopic ? await generateQuestion(input) : await modifyQuestion(input);
    if (isTopic) {
      db.run('INSERT OR IGNORE INTO questions (topic) VALUES (?)', [input]);
    }
    res.json({ question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/popular', (req, res) => {
  db.all('SELECT topic, count FROM questions ORDER BY count DESC LIMIT 10', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Server start
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Gemini functions
async function generateQuestion(topic) {
  const prompt = `Generate a detailed question about ${topic} with specific numerical values. Format: Question: [question]`;
  const result = await model.generateContent(prompt);
  return (await result.response).text();
}

async function modifyQuestion(question) {
  const prompt = `Create a similar question to "${question}" by changing only the numerical values. Maintain the same structure and question type.`;
  const result = await model.generateContent(prompt);
  return (await result.response).text();
}