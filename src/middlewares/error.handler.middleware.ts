import { Request, Response, NextFunction } from 'express';

import { StatusCode } from '@constants/status-code-constants/statusCode.constants';
import { ApiError } from '@utils/api.error';

interface ErrorWithMessage {
  message?: string;
}

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    (typeof (error as ErrorWithMessage).message === 'string' ||
      (error as ErrorWithMessage).message === undefined)
  );
};

const ErrorHandler = (err: unknown, _: Request, res: Response, __: NextFunction): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      data: err.data,
    });
  } else {
    const errorMessage =
      isErrorWithMessage(err) && err.message ? err.message : 'Internal Server Error';

    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: errorMessage,
    });
  }
};

export { ErrorHandler };
