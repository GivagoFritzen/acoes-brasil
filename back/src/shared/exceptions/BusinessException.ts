import { AppException } from "./AppException";

export class BusinessException extends AppException {
  constructor(message: string) {
    super(message, 400);
  }
}
