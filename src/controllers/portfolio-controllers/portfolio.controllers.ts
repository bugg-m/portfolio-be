/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios from 'axios';
import { Request, Response } from 'express';

import { AdminRequestBodyTypes } from '@/types/portfolio-types/admin.types';
import { SendMessageRequestBodyTypes } from '@/types/portfolio-types/contact.types';
import { Message } from '@constants/message-constants/message.constants';
import { StatusCode } from '@constants/status-code-constants/statusCode.constants';
import { Admin } from '@models/portfolio-models/admin.model';
import { SendMessage } from '@models/portfolio-models/send.message.models';
import { ApiError } from '@utils/apiError';
import { ApiResponse } from '@utils/apiResponse';
import { asyncTryCatchHandler } from '@utils/asyncHandlers';
import { deleteFileOnCloudinary, uploadFileOnCloudinary } from '@utils/cloudinary';

const registerAdmin = asyncTryCatchHandler(
  async (req: Request<object, object, AdminRequestBodyTypes>, res: Response) => {
    const { username, fullname, email, password, secretToken } = req.body;

    if (
      [username, fullname, email, password, secretToken].some(
        value => value?.trim() === '' || value === undefined
      )
    ) {
      throw new ApiError({
        statusCode: StatusCode.BAD_REQUEST,
        message: Message.ALL_FIELDS_REQUIRED,
        status: false,
      });
    }

    const isExistedUser = await Admin.findOne({
      $or: [{ username }, { email }],
    });

    if (isExistedUser) {
      throw new ApiError({
        statusCode: StatusCode.CONFLICT,
        message: Message.USER_ALREADY_EXISTS,
        status: false,
      });
    }

    const admin = await Admin.create({
      username,
      fullname,
      email,
      password,
      secretToken,
    });
    const createdAdmin = await Admin.findById(admin._id).select('-password -secretToken');

    if (!createdAdmin) {
      throw new ApiError({
        statusCode: StatusCode.INTERNAL_SERVER_ERROR,
        message: Message.SOMETHING_WENT_WRONG_REGISTERING_USER,
        status: false,
      });
    }

    res.status(StatusCode.CREATED).json(
      new ApiResponse({
        statusCode: StatusCode.OK,
        message: Message.USER_CREATED_SUCCESSFULLY,
        data: createdAdmin,
        status: true,
      })
    );
  }
);

const loginAdmin = asyncTryCatchHandler(
  async (req: Request<object, object, AdminRequestBodyTypes>, res: Response) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
      throw new ApiError({
        statusCode: StatusCode.BAD_REQUEST,
        message: Message.USERNAME_EMAIL_REQUIRED,
        status: false,
      });
    }

    const admin = await Admin.findOne({
      $or: [{ username }, { email }],
    });

    if (!admin) {
      throw new ApiError({
        statusCode: StatusCode.NOT_FOUND,
        message: Message.USER_NOT_FOUND,
        status: false,
      });
    }

    const isValidPassword = await admin.isPasswordCorrect(password);

    if (!isValidPassword) {
      throw new ApiError({
        statusCode: StatusCode.CONFLICT,
        message: Message.INVALID_PASSWORD,
        status: false,
      });
    }

    const loggedInAdmin = await Admin.findById(admin._id).select('-password -secretToken');

    if (!loggedInAdmin) {
      throw new ApiError({
        statusCode: StatusCode.INTERNAL_SERVER_ERROR,
        message: Message.SOMETHING_WENT_WRONG_REGISTERING_USER,
        status: false,
      });
    }

    res.status(StatusCode.OK).json(
      new ApiResponse({
        statusCode: StatusCode.OK,
        message: Message.USER_LOGGED_IN,
        data: loggedInAdmin,
        status: true,
      })
    );
  }
);

const updateAdminAvatar = asyncTryCatchHandler(async (req: Request, res: Response) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError({
      statusCode: StatusCode.BAD_REQUEST,
      message: Message.AVATAR_NOT_PROVIDED,
      status: false,
    });
  }
  const createdAdmin = await Admin.findOne().select('-password -secretToken');

  if (!createdAdmin) {
    throw new ApiError({
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
      message: Message.SOMETHING_WENT_WRONG_REGISTERING_USER,
      status: false,
    });
  }

  res.status(StatusCode.CREATED).json(
    new ApiResponse({
      statusCode: StatusCode.OK,
      message: Message.USER_CREATED_SUCCESSFULLY,
      data: createdAdmin,
      status: true,
    })
  );
});

const getGithubProjects = asyncTryCatchHandler(async (_: Request, res: Response) => {
  const { status, data } = await axios.get(process.env.GITHUB_REPOS_URL ?? '', {
    headers: {
      Authorization: process.env.GITHUB_ACCESS_TOKEN,
      'Admin-Agent': process.env.APP_NAME,
    },
  });

  if (status !== 200 && data === undefined) {
    throw new ApiError({
      statusCode: StatusCode.NOT_FOUND,
      message: Message.REPOS_NOT_FOUND,
      status: false,
    });
  }

  res.status(StatusCode.OK).json(
    new ApiResponse({
      statusCode: StatusCode.OK,
      message: Message.REPOS_FETCHED,
      data,
      status: true,
    })
  );
});

const sendMessage = asyncTryCatchHandler(
  async (req: Request<object, object, SendMessageRequestBodyTypes>, res: Response) => {
    const { name, email, message } = req.body;

    if ([name, email, message].some(value => value?.trim() === '')) {
      throw new ApiError({
        statusCode: StatusCode.BAD_REQUEST,
        message: Message.ALL_FIELDS_REQUIRED,
        status: false,
      });
    }

    let sentMessages = await SendMessage.findOne({ email });

    if (sentMessages) {
      sentMessages.messages.push({
        message,
        time: new Date(),
      });

      await sentMessages.save();
    } else {
      sentMessages = new SendMessage({
        name,
        email,
        messages: [
          {
            message,
            time: new Date(),
          },
        ],
      });

      await sentMessages.save();
    }

    res.status(StatusCode.OK).json(
      new ApiResponse({
        statusCode: StatusCode.OK,
        message: Message.MESSAGE_SEND,
        status: true,
      })
    );
  }
);

const uploadCV = asyncTryCatchHandler(
  async (req: Request<object, object, AdminRequestBodyTypes>, res: Response) => {
    const cvLocalPath = req?.file?.path;
    const { secretToken } = req.body;

    if (!cvLocalPath) {
      throw new ApiError({
        statusCode: StatusCode.BAD_REQUEST,
        message: Message.CV_NOT_PROVIDED,
        status: false,
      });
    }
    if (!secretToken) {
      throw new ApiError({
        statusCode: StatusCode.BAD_REQUEST,
        message: Message.SECRET_TOKEN_NOT_PROVIDED,
        status: false,
      });
    }

    const admin = await Admin.findOne();

    if (!admin) {
      throw new ApiError({
        statusCode: StatusCode.NOT_FOUND,
        message: Message.USER_NOT_FOUND,
        status: false,
      });
    }

    const isValidSecretToken = await admin.isSecretTokenCorrect(secretToken);

    if (!isValidSecretToken) {
      throw new ApiError({
        statusCode: StatusCode.FORBIDDEN,
        message: Message.UNAUTHORIZED_REQUEST,
        status: false,
      });
    }

    if (admin.myCV.public_id) {
      await deleteFileOnCloudinary(admin.myCV.public_id);
    }
    const uploadCVOnCloudinary = await uploadFileOnCloudinary(cvLocalPath);

    if (!uploadCVOnCloudinary) {
      throw new ApiError({
        statusCode: StatusCode.BAD_REQUEST,
        message: Message.FAILED_TO_UPLOAD_CLOUDINARY,
        status: false,
      });
    }

    admin.myCV = {
      originalName: uploadCVOnCloudinary.original_filename,
      url: uploadCVOnCloudinary.secure_url,
      public_id: uploadCVOnCloudinary.public_id,
    };

    await admin.save();

    const updatedAdmin = await Admin.findOne().select('-password -secretToken');

    if (!updatedAdmin?.myCV) {
      throw new ApiError({
        statusCode: StatusCode.FORBIDDEN,
        message: Message.CV_NOT_UPLOADED,
        status: false,
      });
    }

    res.status(StatusCode.OK).json(
      new ApiResponse({
        statusCode: StatusCode.OK,
        message: Message.CV_UPLOADED,
        status: true,
      })
    );
  }
);

const downloadCV = asyncTryCatchHandler(async (_: Request, res: Response) => {
  const admin = await Admin.findOne();

  if (!admin) {
    throw new ApiError({
      statusCode: StatusCode.NOT_FOUND,
      message: Message.USER_NOT_FOUND,
      status: false,
    });
  }
  if (!admin.myCV.url) {
    throw new ApiError({
      statusCode: StatusCode.NOT_FOUND,
      message: Message.CV_NOT_FOUND,
      status: false,
    });
  }

  admin.cvDownloadCount += 1;
  await admin.save();

  res.status(StatusCode.OK).json(
    new ApiResponse({
      statusCode: StatusCode.OK,
      message: Message.CV_DOWNLOADED,
      status: true,
      data: { url: admin.myCV.url },
    })
  );
});

export {
  getGithubProjects,
  sendMessage,
  uploadCV,
  downloadCV,
  registerAdmin,
  loginAdmin,
  updateAdminAvatar,
};
