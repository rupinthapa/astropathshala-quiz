import { StatusCode } from 'hono/utils/http-status';
import { HonoRequest } from 'hono';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  status: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (err: unknown, req?: HonoRequest) => {
  console.error('Error:', err);
  
  if (err instanceof AppError) {
    return new Response(
      JSON.stringify({
        status: err.status,
        message: err.message,
      }),
      {
        status: err.statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Handle other types of errors
  const statusCode = 500;
  const message = 'Something went wrong';
  
  return new Response(
    JSON.stringify({
      status: 'error',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err instanceof Error ? err.stack : undefined }),
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export const notFoundHandler = (req: HonoRequest) => {
  throw new AppError(`Can't find ${req.url} on this server!`, 404);
};

export const errorHandler = (err: unknown, req: HonoRequest) => {
  return handleError(err, req);
};
