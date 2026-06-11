const axios = require('axios');

const CACHE = new Map();
const CACHE_TTL = 30000;

const getCachedData = (key) => {
  const item = CACHE.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  CACHE.set(key, { data, timestamp: Date.now() });
};

const fetchFundData = async (code) => {
  const cacheKey = `fund_${code}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://fund.eastmoney.com/pingzhongdata/${code}.js?v=${Date.now()}`;
    const response = await axios.get(url);
    const data = response.data;

    const match = data.match(/var\s+fundTimelyData\s*=\s*(\{[\s\S]*?\});/);
    if (match) {
      const fundData = JSON.parse(match[1]);
      setCachedData(cacheKey, fundData);
      return fundData;
    }

    return null;
  } catch (error) {
    console.error(`获取基金 ${code} 数据失败:`, error.message);
    return null;
  }
};

const fetchFundValuation = async (code) => {
  const cacheKey = `valuation_${code}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://fundgz.1234567.com.cn/js/${code}.js`;
    const response = await axios.get(url);
    const data = response.data;

    const match = data.match(/jsonpgz\((\{[\s\S]*?\})\)/);
    if (match) {
      const valuation = JSON.parse(match[1]);
      setCachedData(cacheKey, valuation);
      return valuation;
    }

    return null;
  } catch (error) {
    console.error(`获取基金 ${code} 估值失败:`, error.message);
    return null;
  }
};

const searchFunds = async (keyword) => {
  try {
    const url = `https://suggest3.sinajs.cn/suggest/type=101&key=${encodeURIComponent(keyword)}`;
    const response = await axios.get(url);
    const data = response.data;

    const match = data.match(/var\s+SuggestData_101\s*=\s*(\[.*?\]);/);
    if (match) {
      const funds = JSON.parse(match[1]);
      return funds.map(item => ({
        code: item[0],
        name: item[1],
        abbrName: item[2],
        type: item[3]
      }));
    }

    return [];
  } catch (error) {
    console.error(`搜索基金失败:`, error.message);
    return [];
  }
};

const getFundHistory = async (code, days = 30) => {
  try {
    const url = `https://api.fund.eastmoney.com/f10/lsjz?fundCode=${code}&pageIndex=1&pageSize=${days}`;
    const response = await axios.get(url, {
      headers: {
        'Referer': `https://fund.eastmoney.com/${code}.html`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`获取基金 ${code} 历史净值失败:`, error.message);
    return null;
  }
};

const getMarketIndices = async () => {
  const cacheKey = 'market_indices';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const indices = [
      { code: 'sh000001', name: '上证指数', exchange: 'sh' },
      { code: 'sz399001', name: '深证成指', exchange: 'sz' },
      { code: 'sz399006', name: '创业板指', exchange: 'sz' },
      { code: 'sh000016', name: '上证50', exchange: 'sh' },
      { code: 'sh000300', name: '沪深300', exchange: 'sh' },
      { code: 'sh000905', name: '中证500', exchange: 'sh' },
    ];

    const results = await Promise.all(
      indices.map(async (index) => {
        try {
          const url = `https://qt.gtimg.cn/q=${index.exchange}${index.code.slice(2)}`;
          const response = await axios.get(url);
          const data = response.data;
          const parts = data.split('~');
          
          return {
            code: index.code,
            name: index.name,
            price: parseFloat(parts[3]),
            change: parseFloat(parts[4]),
            changePercent: parseFloat(parts[5]),
            high: parseFloat(parts[33]),
            low: parseFloat(parts[34]),
            open: parseFloat(parts[54]),
            volume: parseFloat(parts[53]),
            turnover: parseFloat(parts[36])
          };
        } catch (error) {
          console.error(`获取指数 ${index.code} 失败:`, error.message);
          return {
            code: index.code,
            name: index.name,
            price: null,
            change: null,
            changePercent: null,
            high: null,
            low: null,
            open: null,
            volume: null,
            turnover: null
          };
        }
      })
    );

    setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    console.error('获取市场指数失败:', error.message);
    return [];
  }
};

const getFundValuation = async (code) => {
  const valuation = await fetchFundValuation(code);
  if (!valuation) return null;

  const fundData = await fetchFundData(code);

  return {
    code: valuation.fundcode,
    name: valuation.name,
    gsz: parseFloat(valuation.gsz),
    gszzl: parseFloat(valuation.gszzl),
    dwjz: parseFloat(valuation.dwjz),
    jzrq: valuation.jzrq,
    gztime: valuation.gztime,
    ...(fundData ? {
      fundType: fundData.FundType,
      establishDate: fundData.EstablishDate,
      manager: fundData.Manager,
      scale: fundData.Scale
    } : {})
  };
};

const getFundList = async (codes) => {
  const results = await Promise.all(
    codes.map(code => getFundValuation(code.trim()))
  );
  return results.filter(Boolean);
};

module.exports = {
  getFundValuation,
  getFundList,
  searchFunds,
  getFundHistory,
  getMarketIndices
};