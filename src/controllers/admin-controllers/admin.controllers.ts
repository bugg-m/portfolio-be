import { Message } from "@constants/message-constants/message.constants";
import { StatusCode } from "@constants/status-code-constants/statusCode.constants";
import { ApiError } from "@utils/apiError";
import { ApiResponse } from "@utils/apiResponse";
import { asyncPromiseHandler } from "@utils/asyncHandlers";
import { USER_SUMMARY } from "app.constants";
import axios from "axios";
import { Request, Response } from "express";

const getAdminSummary = asyncPromiseHandler(async (_: Request, res: Response) => {
    const { status, data } = await axios.get(process.env.GITHUB_API_URL ?? "");

    if (status !== 200 && data === undefined) {
        const ErrorResponse = {
            statusCode: StatusCode.NOT_FOUND,
            message: Message.ADMIN_SUMMARY_NOT_FOUND,
            status: false
        };
        throw new ApiError(ErrorResponse);
    }

    const jsonResponse = {
        statusCode: StatusCode.OK,
        message: Message.ADMIN_SUMMARY_FETCHED,
        data: { name: data.name, bio: data.bio, userSummary: USER_SUMMARY },
        status: true
    };

    return res.status(StatusCode.OK).json(new ApiResponse(jsonResponse));
});

export { getAdminSummary };
