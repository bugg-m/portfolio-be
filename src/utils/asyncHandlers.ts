import { Request, Response, NextFunction, RequestHandler } from "express";

const asyncPromiseHandler = (requestHandler: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
};

const asyncTryCatchHandler =
    (requestHandler: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
        try {
            await requestHandler(req, res, next);
            next();
        } catch (error: any) {
            res.status(error.code || 500).json({ error: error.message || "Internal Server Error!" });
        }
    };

export { asyncPromiseHandler, asyncTryCatchHandler };
