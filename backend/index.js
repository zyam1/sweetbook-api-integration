require('dotenv').config();
const express = require('express');
const cors = require('cors');

const booksRouter = require('./routes/books');
const ordersRouter = require('./routes/orders');
const creditsRouter = require('./routes/credits');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/books', booksRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/credits', creditsRouter);

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
