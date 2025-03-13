import { Request, Response, NextFunction } from 'express';

import { getStatusCode } from '@helpers/statuscode.helper';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<void | Response<any>>;

const asyncTryCatchHandler =
  (requestHandler: AsyncRequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    void (async (): Promise<void> => {
      try {
        const result = await requestHandler(req, res, next);
        if (!res.headersSent && result === undefined) {
          next();
        }
      } catch (error: unknown) {
        const code = getStatusCode(error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error!';
        res.status(code || 500).json({ error: errorMessage });
      }
    })();
  };

export { asyncTryCatchHandler };
