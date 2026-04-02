require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { SweetbookClient } = require('bookprintapi-nodejs-sdk');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// SDK 클라이언트 초기화
const client = new SweetbookClient({
  apiKey: process.env.SWEETBOOK_API_KEY,
  baseUrl: process.env.SWEETBOOK_API_BASE_URL,
});

// 판형(BookSpec) 조회
app.get('/api/book-specs', async (req, res) => {
  try {
    const data = await client.books.list();
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

// 충전금 잔액 조회
app.get('/api/credits', async (req, res) => {
  try {
    const data = await client.credits.getBalance();
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

// 책 목록 조회
app.get('/api/books', async (req, res) => {
  try {
    const data = await client.books.list(req.query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

// 책 생성
app.post('/api/books', async (req, res) => {
  try {
    const data = await client.books.create(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

// 책 상세 조회
app.get('/api/books/:bookUid', async (req, res) => {
  try {
    const data = await client.books.get(req.params.bookUid);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

// 주문 목록 조회
app.get('/api/orders', async (req, res) => {
  try {
    const data = await client.orders.list(req.query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

// API 연결 테스트 (충전금 조회로 인증 확인)
app.get('/api/health', async (req, res) => {
  try {
    const credits = await client.credits.getBalance();
    res.json({
      success: true,
      message: 'API 연결 성공',
      data: { credits },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: 'API 연결 실패',
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
