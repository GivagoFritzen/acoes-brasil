export interface ApiEndpoints {
  orders: string;
  portfolios: string;
  proventos: string;
  fundamentus: string;
  investidor10: string;
  googleFinance: string;
  tradingHours: string;
  yahooFinance: string;
}

export interface ApiConfig {
  baseUrl: string;
  endpoints: ApiEndpoints;
}

export const API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:3000',
  endpoints: {
    orders: '/orders',
    portfolios: '/portfolios',
    proventos: '/proventos',
    fundamentus: '/fundamentus',
    investidor10: '/investidor10',
    googleFinance: '/google-finance',
    tradingHours: '/trading-hours',
    yahooFinance: '/yahoo-finance'
  }
};

export const getApiUrl = (endpoint: keyof ApiEndpoints): string => {
  return `${API_CONFIG.baseUrl}${API_CONFIG.endpoints[endpoint]}`;
};
