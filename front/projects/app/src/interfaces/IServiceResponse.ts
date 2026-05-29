export interface ServiceResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}
