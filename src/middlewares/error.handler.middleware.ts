import { Request, Response, NextFunction } from 'express';

import { StatusCode } from '@constants/status-code-constants/statusCode.constants';
import { ApiError } from '@utils/apiError';

const ErrorHandler = (err: any, _: Request, res: Response, __: NextFunction): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      data: err.data,
    });
  } else {
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: err.message ?? 'Internal Server Error',
    });
  }
};

export { ErrorHandler };
