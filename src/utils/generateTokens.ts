import { User } from "@models/user-models/user.model";
import { ApiError } from "./apiError";
import { StatusCode } from "@constants/status-code-constants/statusCode.constants";
import { Message } from "@constants/message-constants/message.constants";

const generateAccessTokenRefreshToken = async (userId: string) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            const ErrorResponse = {
                statusCode: StatusCode.CONFLICT,
                message: Message.INVALID_PASSWORD,
                status: false
            };
            throw new ApiError(ErrorResponse);
        }
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        const ErrorResponse = {
            statusCode: StatusCode.BAD_REQUEST,
            message: Message.INVALID_TOKEN,
            status: false
        };
        throw new ApiError(ErrorResponse);
    }
};

export { generateAccessTokenRefreshToken };
