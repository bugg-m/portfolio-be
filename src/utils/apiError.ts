class ApiError extends Error {
  statusCode: number;
  data: unknown;
  errors: unknown;
  status: boolean;

  constructor({
    statusCode,
    message = 'Something went wrong',
    status = false,
    data = null,
    errors = [],
    stack = '',
  }: {
    statusCode: number;
    message: string;
    status: boolean;
    data?: unknown;
    errors?: unknown;
    stack?: string;
  }) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    this.data = data;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
