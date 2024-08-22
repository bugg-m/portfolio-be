import { Message } from "@constants/message-constants/message.constants";
import { StatusCode } from "@constants/status-code-constants/statusCode.constants";
import { CustomRequest, JwtPayloadWithId } from "@middlewares/auth.middleware";
import { Admin } from "@models/admin-model/admin.model";
import { options, USER_SUMMARY } from "@src/app.constants";
import { RegisterAdminRequestBody } from "@src/types/admin.types";
import { ApiError } from "@utils/apiError";
import { ApiResponse } from "@utils/apiResponse";
import { asyncTryCatchHandler } from "@utils/asyncHandlers";
import { generateAccessTokenRefreshToken } from "@utils/generateTokens";
import axios from "axios";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const registerAdmin = asyncTryCatchHandler(async (req: Request<{}, {}, RegisterAdminRequestBody>, res: Response) => {
    const { username, adminSecret, email, password } = req?.body;

    if ([username, adminSecret, email, password].some((value) => value?.trim() === "")) {
        throw new ApiError({
            statusCode: StatusCode.BAD_REQUEST,
            message: Message.ALL_FIELDS_REQUIRED,
            status: false
        });
    }

    const isExistedUser = await Admin.findOne({
        $or: [{ username }, { email }]
    });

    if (isExistedUser) {
        throw new ApiError({
            statusCode: StatusCode.CONFLICT,
            message: Message.USERNAME_ALREADY_EXISTS,
            status: false
        });
    }

    const admin = await Admin.create({
        username,
        email,
        adminSecret,
        password
    });
    const createdAdmin = await Admin.findById(admin._id).select("-password -refreshToken -adminSecret");

    if (!createdAdmin) {
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
            data: createdAdmin,
            status: true
        })
    );
});

const loginAdmin = asyncTryCatchHandler(async (req: Request, res: Response) => {
    const { username, email, password, adminSecret } = req?.body;

    if (!username && !email) {
        throw new ApiError({
            statusCode: StatusCode.BAD_REQUEST,
            message: Message.USERNAME_EMAIL_REQUIRED,
            status: false
        });
    }

    const admin = await Admin.findOne({
        $or: [{ username }, { email }]
    });

    if (!admin) {
        throw new ApiError({
            statusCode: StatusCode.NOT_FOUND,
            message: Message.USER_NOT_FOUND,
            status: false
        });
    }

    const isValidPassword = await admin.isPasswordCorrect(password);

    if (!isValidPassword) {
        throw new ApiError({
            statusCode: StatusCode.CONFLICT,
            message: Message.INVALID_PASSWORD,
            status: false
        });
    }
    const isValidAdminSecret = await admin.isAdminSecretCorrect(adminSecret);

    if (!isValidAdminSecret) {
        throw new ApiError({
            statusCode: StatusCode.CONFLICT,
            message: Message.INVALID_ADMIN_SECRET,
            status: false
        });
    }

    const { accessToken, refreshToken } = await generateAccessTokenRefreshToken(admin._id);

    const loggedInUser = await Admin.findById(admin._id).select("-password -refreshToken");

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
});

const refreshAdminAccessToken = asyncTryCatchHandler(async (req: Request, res: Response) => {
    const token = req.cookies["accessToken"] || req.body.refreshToken;

    if (!token) {
        throw new ApiError({
            statusCode: StatusCode.UNAUTHORIZED,
            message: Message.UNAUTHORIZED_REQUEST,
            status: false
        });
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET ?? "") as JwtPayloadWithId;

    if (!decodedToken) {
        throw new ApiError({
            statusCode: StatusCode.CONFLICT,
            message: Message.INVALID_TOKEN,
            status: false
        });
    }

    const admin = await Admin.findById(decodedToken._id);

    if (!admin) {
        throw new ApiError({
            statusCode: StatusCode.NOT_FOUND,
            message: Message.USER_NOT_FOUND,
            status: false
        });
    }

    if (admin?.refreshToken !== token) {
        throw new ApiError({
            statusCode: StatusCode.BAD_REQUEST,
            message: Message.REFRESH_TOKEN_EXPIRED,
            status: false
        });
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenRefreshToken(admin._id);

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

const logoutAdmin = asyncTryCatchHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user && req.user._id;

    await Admin.findByIdAndUpdate(
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

const getAdminSummary = asyncTryCatchHandler(async (_: Request, res: Response) => {
    const { status, data } = await axios.get(process.env.GITHUB_API_URL ?? "");

    if (status !== 200 && data === undefined) {
        throw new ApiError({
            statusCode: StatusCode.NOT_FOUND,
            message: Message.ADMIN_SUMMARY_NOT_FOUND,
            status: false
        });
    }

    return res.status(StatusCode.OK).json(
        new ApiResponse({
            statusCode: StatusCode.OK,
            message: Message.ADMIN_SUMMARY_FETCHED,
            data: { name: data.name, bio: data.bio, userSummary: USER_SUMMARY },
            status: true
        })
    );
});

const getAdminProjects = asyncTryCatchHandler(async (_: Request, res: Response) => {
    const { status, data } = await axios.get(process.env.GITHUB_REPOS_URL ?? "");

    if (status !== 200 && data === undefined) {
        throw new ApiError({
            statusCode: StatusCode.NOT_FOUND,
            message: Message.ADMIN_REPOS_NOT_FOUND,
            status: false
        });
    }

    return res.status(StatusCode.OK).json(
        new ApiResponse({
            statusCode: StatusCode.OK,
            message: Message.ADMIN_REPOS_FETCHED,
            data,
            status: true
        })
    );
});

export { getAdminSummary, getAdminProjects, registerAdmin, loginAdmin, logoutAdmin, refreshAdminAccessToken };
