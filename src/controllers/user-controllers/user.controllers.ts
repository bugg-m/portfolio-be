import { Request, Response } from "express";
import { asyncTryCatchHandler } from "@utils/asyncHandlers";
import { ApiError } from "@utils/apiError";
import { StatusCode } from "@constants/status-code-constants/statusCode.constants";
import { Message } from "@constants/message-constants/message.constants";
import { ApiResponse } from "@utils/apiResponse";
import { User } from "@models/user-models/user.model";
import { generateAccessTokenRefreshToken } from "@utils/generateTokens";
import * as Auth from "@middlewares/auth.middleware";
import { options } from "@src/app.constants";
import jwt from "jsonwebtoken";
import * as UserRequestBody from "@src/types/user.types";

const registerUser = asyncTryCatchHandler(
    async (req: Request<{}, {}, UserRequestBody.UserRequestBodyTypes>, res: Response) => {
        const { username, fullname, email, password } = req?.body;

        if ([username, fullname, email, password].some((value) => value?.trim() === "")) {
            throw new ApiError({
                statusCode: StatusCode.BAD_REQUEST,
                message: Message.ALL_FIELDS_REQUIRED,
                status: false
            });
        }

        const isExistedUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (isExistedUser) {
            throw new ApiError({
                statusCode: StatusCode.CONFLICT,
                message: Message.USER_ALREADY_EXISTS,
                status: false
            });
        }

        const user = await User.create({
            username,
            fullname,
            email,
            password
        });
        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            throw new ApiError({
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
                message: Message.SOMETHING_WENT_WRONG_REGISTERING_USER,
                status: false
            });
        }

        return res.status(StatusCode.CREATED).json(
            new ApiResponse({
                statusCode: StatusCode.OK,
                message: Message.USER_CREATED_SUCCESSFULLY,
                data: createdUser,
                status: true
            })
        );
    }
);

const loginUser = asyncTryCatchHandler(
    async (req: Request<{}, {}, UserRequestBody.UserRequestBodyTypes>, res: Response) => {
        const { username, email, password } = req?.body;

        if (!username && !email) {
            throw new ApiError({
                statusCode: StatusCode.BAD_REQUEST,
                message: Message.USERNAME_EMAIL_REQUIRED,
                status: false
            });
        }

        const user = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (!user) {
            throw new ApiError({
                statusCode: StatusCode.NOT_FOUND,
                message: Message.USER_NOT_FOUND,
                status: false
            });
        }

        const isValidPassword = await user.isPasswordCorrect(password);

        if (!isValidPassword) {
            throw new ApiError({
                statusCode: StatusCode.CONFLICT,
                message: Message.INVALID_PASSWORD,
                status: false
            });
        }

        const { accessToken, refreshToken } = await generateAccessTokenRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        if (!loggedInUser) {
            throw new ApiError({
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
                message: Message.SOMETHING_WENT_WRONG_REGISTERING_USER,
                status: false
            });
        }

        return res
            .status(StatusCode.OK)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse({
                    statusCode: StatusCode.OK,
                    message: Message.USER_LOGGED_IN,
                    data: { loggedInUser, accessToken, refreshToken },
                    status: true
                })
            );
    }
);

const refreshAccessToken = asyncTryCatchHandler(async (req: Request, res: Response) => {
    const token = req.cookies["accessToken"] || req.body.refreshToken;

    if (!token) {
        throw new ApiError({
            statusCode: StatusCode.UNAUTHORIZED,
            message: Message.UNAUTHORIZED_REQUEST,
            status: false
        });
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET ?? "") as Auth.JwtPayloadWithId;

    if (!decodedToken) {
        throw new ApiError({
            statusCode: StatusCode.CONFLICT,
            message: Message.INVALID_TOKEN,
            status: false
        });
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
        throw new ApiError({
            statusCode: StatusCode.NOT_FOUND,
            message: Message.USER_NOT_FOUND,
            status: false
        });
    }

    if (user?.refreshToken !== token) {
        throw new ApiError({
            statusCode: StatusCode.BAD_REQUEST,
            message: Message.REFRESH_TOKEN_EXPIRED,
            status: false
        });
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenRefreshToken(user._id);

    return res
        .status(StatusCode.OK)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse({
                statusCode: StatusCode.OK,
                message: Message.ACCESS_TOKEN_REFRESHED,
                data: { accessToken, newRefreshToken },
                status: true
            })
        );
});

const logoutUser = asyncTryCatchHandler(async (req: Auth.CustomRequest, res: Response) => {
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

    return res
        .status(StatusCode.OK)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse({
                statusCode: StatusCode.OK,
                message: Message.USER_LOGGED_OUT,
                status: true
            })
        );
});

const updateUserAvatar = asyncTryCatchHandler(async (req: Request, res: Response) => {
    const user = req.body.user;
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        const ErrorResponse = {
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            message: Message.SOMETHING_WENT_WRONG_REGISTERING_USER,
            status: false
        };
        throw new ApiError(ErrorResponse);
    }

    const jsonResponse = {
        statusCode: StatusCode.OK,
        message: Message.USER_CREATED_SUCCESSFULLY,
        data: createdUser,
        status: true
    };

    return res.status(StatusCode.CREATED).json(new ApiResponse(jsonResponse));
});

export { registerUser, updateUserAvatar, loginUser, logoutUser, refreshAccessToken };
