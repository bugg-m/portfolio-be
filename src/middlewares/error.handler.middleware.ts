import { Request, Response, NextFunction } from 'express';

import { getStatusCode, isErrorWithMessage } from '@helpers/statuscode.helper';
import { ApiError } from '@utils/api.error';

const ErrorHandler = (err: unknown, _: Request, res: Response, __: NextFunction): void => {
  if (res.headersSent) {
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      data: err.data,
    });
  } else {
    const statusCode = getStatusCode(err);
    const errorMessage =
      isErrorWithMessage(err) && err.message ? err.message : 'Internal Server Error';

    res.status(statusCode).json({
      status: false,
      message: errorMessage,
    });
  }
};

export { ErrorHandler };
