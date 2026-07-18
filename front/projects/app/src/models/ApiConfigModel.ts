import type { ApiEndpoints } from '../config/ApiEndpointsConfig';

export interface ApiConfig {
  baseUrl: string;
  endpoints: ApiEndpoints;
}
