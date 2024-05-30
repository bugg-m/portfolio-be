import { Message } from "@constants/message-constants/message.constants";
import { StatusCode } from "@constants/status-code-constants/statusCode.constants";
import { User, UserDocument } from "@models/user-models/user.model";
import { ApiError } from "@utils/apiError";
import { asyncPromiseHandler } from "@utils/asyncHandlers";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface CustomRequest extends Request {
    user?: UserDocument;
}

export interface JwtPayloadWithId extends jwt.JwtPayload {
    _id?: string;
}

const verifyJWT = asyncPromiseHandler(async (req: CustomRequest, _: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            const ErrorResponse = {
                statusCode: StatusCode.UNAUTHORIZED,
                message: Message.INVALID_TOKEN,
                success: false
            };
            throw new ApiError(ErrorResponse);
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET ?? "") as JwtPayloadWithId;

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            const ErrorResponse = {
                statusCode: StatusCode.UNAUTHORIZED,
                message: Message.INVALID_TOKEN,
                success: false
            };
            throw new ApiError(ErrorResponse);
        }

        req.user = user;
        next();
    } catch (error) {
        const ErrorResponse = {
            statusCode: StatusCode.UNAUTHORIZED,
            message: Message.INVALID_TOKEN,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }
});

export { verifyJWT };
