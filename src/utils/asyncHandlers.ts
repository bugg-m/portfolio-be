import { Request, Response, NextFunction, RequestHandler } from 'express';

import { getStatusCode } from '@helpers/statuscode.helper';

const asyncTryCatchHandler =
  (requestHandler: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requestHandler(req, res, next);
      next();
    } catch (error: any) {
      const code = getStatusCode(error);
      res.status(code || 500).json({ error: error.message || 'Internal Server Error!' });
    }
  };

export { asyncTryCatchHandler };
