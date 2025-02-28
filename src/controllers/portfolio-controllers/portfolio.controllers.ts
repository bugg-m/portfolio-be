import { Message } from "@constants/message-constants/message.constants";
import { StatusCode } from "@constants/status-code-constants/statusCode.constants";
import { ApiError } from "@utils/apiError";
import { ApiResponse } from "@utils/apiResponse";
import { asyncTryCatchHandler } from "@utils/asyncHandlers";
import axios from "axios";
import { Request, Response } from "express";

const getGithubProjects = asyncTryCatchHandler(async (_: Request, res: Response) => {
    const { status, data } = await axios.get(process.env.GITHUB_REPOS_URL ?? "", {
        headers: {
            Authorization: process.env.GITHUB_ACCESS_TOKEN,
            "User-Agent": process.env.APP_NAME
        }
    });

    if (status !== 200 && data === undefined) {
        throw new ApiError({
            statusCode: StatusCode.NOT_FOUND,
            message: Message.REPOS_NOT_FOUND,
            status: false
        });
    }

    return res.status(StatusCode.OK).json(
        new ApiResponse({
            statusCode: StatusCode.OK,
            message: Message.REPOS_FETCHED,
            data,
            status: true
        })
    );
});

export { getGithubProjects };
