require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const fundRoutes = require('./routes/fund');
const corsConfig = require('./config/cors');

const app = express();
const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', fundRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    message: '基金估值后端服务运行正常',
    availableEndpoints: [
      { method: 'GET', path: '/api/health', description: '健康检查' },
      { method: 'GET', path: '/api/fund/valuation/:code', description: '获取单个基金估值' },
      { method: 'GET', path: '/api/fund/list?codes=xxx,yyy', description: '批量获取基金列表' },
      { method: 'GET', path: '/api/fund/search?keyword=xxx', description: '搜索基金' },
      { method: 'GET', path: '/api/fund/history/:code?days=30', description: '获取基金历史净值' },
      { method: 'GET', path: '/api/market/indices', description: '获取市场指数' },
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '基金估值后端服务运行正常' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`基金估值后端服务运行在 http://localhost:${PORT}`);
});