import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<void | Response<any>>;

const asyncControllerHandler =
  (requestHandler: AsyncRequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    void (async (): Promise<void> => {
      try {
        const result = await requestHandler(req, res, next);
        if (!res.headersSent && result === undefined) {
          next();
        }
      } catch (error: unknown) {
        next(error);
      }
    })();
  };

const asyncMiddlewareHandler =
  (middleware: AsyncRequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    void (async (): Promise<void> => {
      try {
        await middleware(req, res, next);
      } catch (error: unknown) {
        return next(error);
      }
    })();
  };

export { asyncControllerHandler, asyncMiddlewareHandler };
