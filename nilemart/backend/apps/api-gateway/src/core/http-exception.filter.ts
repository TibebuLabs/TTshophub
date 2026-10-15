import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// ─── Global exception filter ──────────────────────────────────────────────────
//
// Catches every unhandled exception and transforms it into a consistent JSON
// error response.  5xx errors are logged; 4xx client errors are not.
//

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    let status: number  = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error   = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'object' && body !== null) {
        const typed = body as Record<string, unknown>;
        if (typeof typed.message === 'string' || Array.isArray(typed.message)) {
          message = typed.message as string | string[];
        }
        if (typeof typed.error === 'string') {
          error = typed.error;
        }
      } else if (typeof body === 'string') {
        message = body;
      }
    }

    if (
      status === HttpStatus.NOT_FOUND &&
      typeof message === 'string' &&
      message.startsWith('Cannot ')
    ) {
      message = `${request.method} ${request.path} not found`;
    }

    const errorResponse = {
      statusCode: status,
      timestamp:  new Date().toISOString(),
      path:       request.path,
      method:     request.method,
      message,
      error,
    };

    if (status >= 500) {
      const detail = exception instanceof Error
        ? exception.stack || exception.message
        : String(exception);
      this.logger.error(`${request.method} ${request.path} - ${detail}`);
    }

    response.status(status).json(errorResponse);
  }
}
