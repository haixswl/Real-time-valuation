const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const request = async (url, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : null
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

export const getFundValuation = async (code) => {
  return await request(`/fund/valuation/${code}`);
};

export const getFundList = async (codes) => {
  return await request(`/fund/list?codes=${codes.join(',')}`);
};

export const searchFunds = async (keyword) => {
  return await request(`/fund/search?keyword=${encodeURIComponent(keyword)}`);
};

export const getFundHistory = async (code, days = 30) => {
  return await request(`/fund/history/${code}?days=${days}`);
};

export const getMarketIndices = async () => {
  return await request('/market/indices');
};

export const healthCheck = async () => {
  return await request('/health');
};