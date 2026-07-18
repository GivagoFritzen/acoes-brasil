import { AppException } from "./AppException";

export class NotFoundException extends AppException {
  constructor(message: string) {
    super(message, 404);
  }
}
