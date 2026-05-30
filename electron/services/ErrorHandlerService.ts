import { IErrorHandler } from '../interfaces/IErrorHandler';

function formatLog(level: string, context: string, error: Error): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${level}: ${context} - ${error.message}${error.stack ? `\n${error.stack}` : ""}`;
}

export class ErrorHandlerService implements IErrorHandler {
  handleError(error: Error, context: string): void {
    console.error(formatLog("ERROR", context, error));
  }
}
