import { AppException } from "./AppException";

export class ValidationException extends AppException {
  constructor(message: string) {
    super(message, 400);
  }
}
