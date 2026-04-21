import { IErrorHandler } from '../interfaces/error-handler.interface';

export class ErrorHandlerService implements IErrorHandler {
  handleError(error: Error, context: string): void {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ${context}: ${error.message}`;

    console.error(errorMessage);

    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}
