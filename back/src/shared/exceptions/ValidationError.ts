import { BusinessException } from "./BusinessException";

export class ValidationError extends BusinessException {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
