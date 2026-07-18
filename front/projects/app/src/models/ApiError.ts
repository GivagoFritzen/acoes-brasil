export interface ApiError {
  message: string;
  status?: number;
  error?: Error | string | object | null;
}
