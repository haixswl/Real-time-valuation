const express = require('express');
const router = express.Router();
const fundService = require('../services/fundService');

router.get('/fund/valuation/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const data = await fundService.getFundValuation(code);
    res.json(data);
  } catch (error) {
    console.error('获取基金估值失败:', error);
    res.status(500).json({ error: '获取基金估值失败', message: error.message });
  }
});

router.get('/fund/list', async (req, res) => {
  try {
    const { codes } = req.query;
    if (!codes) {
      return res.status(400).json({ error: '缺少基金代码参数' });
    }
    const codeList = codes.split(',');
    const data = await fundService.getFundList(codeList);
    res.json(data);
  } catch (error) {
    console.error('获取基金列表失败:', error);
    res.status(500).json({ error: '获取基金列表失败', message: error.message });
  }
});

router.get('/fund/search', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ error: '缺少搜索关键词' });
    }
    const data = await fundService.searchFunds(keyword);
    res.json(data);
  } catch (error) {
    console.error('搜索基金失败:', error);
    res.status(500).json({ error: '搜索基金失败', message: error.message });
  }
});

router.get('/fund/history/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { days = 30 } = req.query;
    const data = await fundService.getFundHistory(code, parseInt(days));
    res.json(data);
  } catch (error) {
    console.error('获取基金历史净值失败:', error);
    res.status(500).json({ error: '获取基金历史净值失败', message: error.message });
  }
});

router.get('/market/indices', async (req, res) => {
  try {
    const data = await fundService.getMarketIndices();
    res.json(data);
  } catch (error) {
    console.error('获取市场指数失败:', error);
    res.status(500).json({ error: '获取市场指数失败', message: error.message });
  }
});

module.exports = router;