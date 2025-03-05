import { Message } from "@constants/message-constants/message.constants";
import { StatusCode } from "@constants/status-code-constants/statusCode.constants";
import { ApiError } from "@utils/apiError";
import { ApiResponse } from "@utils/apiResponse";
import { asyncTryCatchHandler } from "@utils/asyncHandlers";
import axios from "axios";
import { Request, Response } from "express";
import { SendMessage } from "@src/models/portfolio-models/send.message.models";
import { SendMessageRequestBodyTypes } from "@src/types/portfolio-types/contact.types";

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

const sendMessage = asyncTryCatchHandler(async (req: Request<{}, {}, SendMessageRequestBodyTypes>, res: Response) => {
    const { name, email, message } = req?.body;

    if ([name, email, message].some((value) => value?.trim() === "")) {
        throw new ApiError({
            statusCode: StatusCode.BAD_REQUEST,
            message: Message.ALL_FIELDS_REQUIRED,
            status: false
        });
    }

    let contactRecords = await SendMessage.findOne({ email });

    if (contactRecords) {
        contactRecords.messages.push({
            message,
            time: new Date()
        });

        await contactRecords.save();
    } else {
        contactRecords = new SendMessage({
            name,
            email,
            messages: [
                {
                    message,
                    time: new Date()
                }
            ]
        });

        await contactRecords.save();
    }

    return res.status(StatusCode.OK).json(
        new ApiResponse({
            statusCode: StatusCode.OK,
            message: Message.MESSAGE_SEND,
            status: true
        })
    );
});

export { getGithubProjects, sendMessage };
