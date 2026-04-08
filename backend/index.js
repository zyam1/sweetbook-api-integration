require('dotenv').config();
const express = require('express');
const cors = require('cors');

const templatesRouter = require('./routes/templates');
const authRouter = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const anthologyRouter = require('./routes/anthology');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/templates', templatesRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/anthology', anthologyRouter);

// Health check
app.get('/api/health', async (req, res, next) => {
  try {
    const creditService = require('./services/creditService');
    const credits = await creditService.getBalance();
    res.json({ success: true, message: 'API 연결 성공', data: { credits } });
  } catch (err) {
    next(err);
  }
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
