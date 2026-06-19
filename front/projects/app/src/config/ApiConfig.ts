export interface ApiEndpoints {
  orders: string;
  portfolios: string;
  proventos: string;
  fundamentus: string;
  googleFinance: string;
  tradingHours: string;
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
    googleFinance: '/google-finance',
    tradingHours: '/trading-hours'
  }
};

export const getApiUrl = (endpoint: keyof ApiEndpoints): string => {
  return `${API_CONFIG.baseUrl}${API_CONFIG.endpoints[endpoint]}`;
};
