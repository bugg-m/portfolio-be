import { Request, Response } from "express";
import { asyncPromiseHandler } from "@utils/asyncHandlers";
import { ApiError } from "@utils/apiError";
import { StatusCode } from "@constants/status-code-constants/statusCode.constants";
import { Message } from "@constants/message-constants/message.constants";
import { ApiResponse } from "@utils/apiResponse";
import { User } from "@models/user-models/user.model";
import { generateAccessTokenRefreshToken } from "@utils/generateTokens";
import { CustomRequest, JwtPayloadWithId } from "@middlewares/auth.middleware";
import { options } from "app.constants";
import jwt from "jsonwebtoken";

const registerUser = asyncPromiseHandler(async (req: Request, res: Response) => {
    const { username, fullname, email, password } = req?.body;

    if ([username, fullname, email, password].some((value) => value?.trim() === "")) {
        const ErrorResponse = {
            statusCode: StatusCode.BAD_REQUEST,
            message: Message.ALL_FIELDS_REQUIRED,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }

    const isExistedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (isExistedUser) {
        const ErrorResponse = {
            statusCode: StatusCode.CONFLICT,
            message: Message.USER_ALREADY_EXISTS,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }

    const user = await User.create({
        username,
        fullname,
        email,
        password
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        const ErrorResponse = {
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            message: Message.SOMETHING_WENT_WRONG_REGISTERING_USER,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }

    const jsonResponse = {
        statusCode: StatusCode.OK,
        message: Message.USER_CREATED_SUCCESSFULLY,
        data: createdUser,
        success: true
    };

    return res.status(StatusCode.CREATED).json(new ApiResponse(jsonResponse));
});

const loginUser = asyncPromiseHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req?.body;

    if (!username && !email) {
        const ErrorResponse = {
            statusCode: StatusCode.BAD_REQUEST,
            message: Message.USERNAME_EMAIL_REQUIRED,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        const ErrorResponse = {
            statusCode: StatusCode.NOT_FOUND,
            message: Message.USER_NOT_FOUND,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }

    const isValidPassword = await user.isPasswordCorrect(password);

    if (!isValidPassword) {
        const ErrorResponse = {
            statusCode: StatusCode.CONFLICT,
            message: Message.INVALID_PASSWORD,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }

    const { accessToken, refreshToken } = await generateAccessTokenRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    if (!loggedInUser) {
        const ErrorResponse = {
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            message: Message.SOMETHING_WENT_WRONG_REGISTERING_USER,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }

    const jsonResponse = {
        statusCode: StatusCode.OK,
        message: Message.USER_LOGGED_IN,
        data: loggedInUser,
        accessToken,
        refreshToken,
        success: true
    };

    return res
        .status(StatusCode.OK)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(jsonResponse));
});

const refreshAccessToken = asyncPromiseHandler(async (req: Request, res: Response) => {
    const token = req.cookies["accessToken"] || req.body.refreshToken;

    if (!token) {
        const ErrorResponse = {
            statusCode: StatusCode.UNAUTHORIZED,
            message: Message.UNAUTHORIZED_REQUEST,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET ?? "") as JwtPayloadWithId;

    if (!decodedToken) {
        const ErrorResponse = {
            statusCode: StatusCode.CONFLICT,
            message: Message.INVALID_TOKEN,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
        const ErrorResponse = {
            statusCode: StatusCode.NOT_FOUND,
            message: Message.USER_NOT_FOUND,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }

    if (user?.refreshToken !== token) {
        const ErrorResponse = {
            statusCode: StatusCode.BAD_REQUEST,
            message: Message.REFRESH_TOKEN_EXPIRED,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenRefreshToken(user._id);

    const jsonResponse = {
        statusCode: StatusCode.OK,
        message: Message.ACCESS_TOKEN_REFRESHED,
        data: accessToken,
        refreshToken: newRefreshToken,
        success: true
    };

    return res
        .status(StatusCode.OK)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(jsonResponse));
});

const logoutUser = asyncPromiseHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user && req.user._id;

    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const jsonResponse = {
        statusCode: StatusCode.OK,
        message: Message.USER_LOGGED_OUT,
        success: true
    };

    return res
        .status(StatusCode.OK)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(jsonResponse));
});

const updateUserAvatar = asyncPromiseHandler(async (req: Request, res: Response) => {
    const user = req.body.user;
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        const ErrorResponse = {
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            message: Message.SOMETHING_WENT_WRONG_REGISTERING_USER,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }

    const jsonResponse = {
        statusCode: StatusCode.OK,
        message: Message.USER_CREATED_SUCCESSFULLY,
        data: createdUser,
        success: true
    };

    return res.status(StatusCode.CREATED).json(new ApiResponse(jsonResponse));
});

export { registerUser, updateUserAvatar, loginUser, logoutUser, refreshAccessToken };
