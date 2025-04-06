import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

import { options } from '@/app.constants';
import { Message } from '@/constants/message-constants/message.constants';
import { StatusCode } from '@/constants/status-code-constants/statusCode.constants';
import * as Auth from '@/middlewares/auth.middleware';
import { User } from '@/models/user-models/user.model';
import { JwtPayloadWithId } from '@/types/app.types';
import { UserDocument, UserRequestBodyTypes } from '@/types/user.types';
import { ApiError } from '@utils/api.error';
import { ApiResponse } from '@utils/api.response';
import { asyncControllerHandler } from '@utils/async.handler';
import { generateAccessTokenRefreshToken } from '@utils/generate-tokens';

const registerUser = asyncControllerHandler(
  async (req: Request<object, object, UserRequestBodyTypes>, res: Response) => {
    const { username, email, password } = req.body;

    if ([username, email, password].some(value => value?.trim() === '')) {
      throw new ApiError({
        statusCode: StatusCode.BAD_REQUEST,
        message: Message.ALL_FIELDS_REQUIRED,
        status: false,
      });
    }

    const isExistedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (isExistedUser) {
      throw new ApiError({
        statusCode: StatusCode.CONFLICT,
        message: Message.USER_ALREADY_EXISTS,
        status: false,
      });
    }

    const user = await User.create({
      username,
      email,
      password,
    });
    const createdUser = await User.findById(user._id).select('-password -refreshToken');

    if (!createdUser) {
      throw new ApiError({
        statusCode: StatusCode.INTERNAL_SERVER_ERROR,
        message: Message.SOMETHING_WENT_WRONG_REGISTERING_USER,
        status: false,
      });
    }

    return res.status(StatusCode.CREATED).json(
      new ApiResponse({
        statusCode: StatusCode.OK,
        message: Message.USER_CREATED_SUCCESSFULLY,
        data: createdUser,
        status: true,
      })
    );
  }
);

const loginUser = asyncControllerHandler(
  async (req: Request<object, object, UserRequestBodyTypes>, res: Response) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
      throw new ApiError({
        statusCode: StatusCode.BAD_REQUEST,
        message: Message.USERNAME_EMAIL_REQUIRED,
        status: false,
      });
    }

    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      throw new ApiError({
        statusCode: StatusCode.NOT_FOUND,
        message: Message.USER_NOT_FOUND,
        status: false,
      });
    }

    const isValidPassword = await user.isPasswordCorrect(password);

    if (!isValidPassword) {
      throw new ApiError({
        statusCode: StatusCode.CONFLICT,
        message: Message.INVALID_PASSWORD,
        status: false,
      });
    }

    const { accessToken, refreshToken } = await generateAccessTokenRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

    if (!loggedInUser) {
      throw new ApiError({
        statusCode: StatusCode.INTERNAL_SERVER_ERROR,
        message: Message.SOMETHING_WENT_WRONG_REGISTERING_USER,
        status: false,
      });
    }

    return res
      .status(StatusCode.OK)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse({
          statusCode: StatusCode.OK,
          message: Message.USER_LOGGED_IN,
          data: loggedInUser,
          status: true,
        })
      );
  }
);

const refreshAccessToken = asyncControllerHandler(
  async (req: Request<object, object, UserDocument>, res: Response) => {
    const token = String(req.cookies['accessToken'] || req.body.refreshToken);

    if (!token) {
      throw new ApiError({
        statusCode: StatusCode.UNAUTHORIZED,
        message: Message.UNAUTHORIZED_REQUEST,
        status: false,
      });
    }

    const decodedToken = verify(token, process.env.REFRESH_TOKEN_SECRET ?? '') as JwtPayloadWithId;

    if (!decodedToken) {
      throw new ApiError({
        statusCode: StatusCode.CONFLICT,
        message: Message.INVALID_TOKEN,
        status: false,
      });
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError({
        statusCode: StatusCode.NOT_FOUND,
        message: Message.USER_NOT_FOUND,
        status: false,
      });
    }

    if (user?.refreshToken !== token) {
      throw new ApiError({
        statusCode: StatusCode.BAD_REQUEST,
        message: Message.REFRESH_TOKEN_EXPIRED,
        status: false,
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenRefreshToken(
      user._id
    );

    return res
      .status(StatusCode.OK)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        new ApiResponse({
          statusCode: StatusCode.OK,
          message: Message.ACCESS_TOKEN_REFRESHED,
          data: { accessToken, newRefreshToken },
          status: true,
        })
      );
  }
);

const logoutUser = asyncControllerHandler(async (req: Auth.UserRequest, res: Response) => {
  const userId = req?.user?._id;

  if (!userId) {
    throw new ApiError({
      statusCode: StatusCode.UNAUTHORIZED,
      message: Message.UNAUTHORIZED_REQUEST,
      status: false,
    });
  }

  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(StatusCode.OK)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(
      new ApiResponse({
        statusCode: StatusCode.OK,
        message: Message.USER_LOGGED_OUT,
        status: true,
      })
    );
});

const updateUserAvatar = asyncControllerHandler(async (req: Auth.UserRequest, res: Response) => {
  const userId = req?.user?._id;

  const user = await User.findById(userId).select('-password -refreshToken');

  if (!user) {
    const ErrorResponse = {
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
      message: Message.SOMETHING_WENT_WRONG_REGISTERING_USER,
      status: false,
    };
    throw new ApiError(ErrorResponse);
  }

  const jsonResponse = {
    statusCode: StatusCode.OK,
    message: Message.USER_CREATED_SUCCESSFULLY,
    data: user,
    status: true,
  };

  return res.status(StatusCode.CREATED).json(new ApiResponse(jsonResponse));
});

export { registerUser, updateUserAvatar, loginUser, logoutUser, refreshAccessToken };
