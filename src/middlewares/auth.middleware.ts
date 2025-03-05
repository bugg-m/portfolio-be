import { Message } from "@constants/message-constants/message.constants";
import { StatusCode } from "@constants/status-code-constants/statusCode.constants";
import { User } from "@models/user-models/user.model";
import { JwtPayloadWithId } from "@src/types/app.types";
import { UserDocument } from "@src/types/user.types";
import { ApiError } from "@utils/apiError";
import { asyncTryCatchHandler } from "@utils/asyncHandlers";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface CustomRequest extends Request {
    user?: UserDocument;
}

const verifyJWT = asyncTryCatchHandler(async (req: CustomRequest, _: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            const ErrorResponse = {
                statusCode: StatusCode.UNAUTHORIZED,
                message: Message.INVALID_TOKEN,
                status: false
            };
            throw new ApiError(ErrorResponse);
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET ?? "") as JwtPayloadWithId;

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            const ErrorResponse = {
                statusCode: StatusCode.UNAUTHORIZED,
                message: Message.INVALID_TOKEN,
                status: false
            };
            throw new ApiError(ErrorResponse);
        }

        req.user = user;
        next();
    } catch (error) {
        const ErrorResponse = {
            statusCode: StatusCode.UNAUTHORIZED,
            message: Message.INVALID_TOKEN,
            status: false
        };
        throw new ApiError(ErrorResponse);
    }
});

export { verifyJWT };
