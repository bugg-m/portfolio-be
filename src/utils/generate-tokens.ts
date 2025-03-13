import { Message } from '@constants/message-constants/message.constants';
import { StatusCode } from '@constants/status-code-constants/statusCode.constants';
import { User } from '@models/user-models/user.model';

import { ApiError } from './api.error';

const generateAccessTokenRefreshToken = async (
  userId: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError({
        statusCode: StatusCode.CONFLICT,
        message: Message.INVALID_PASSWORD,
        status: false,
      });
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError({
      statusCode: StatusCode.BAD_REQUEST,
      message: Message.INVALID_TOKEN,
      status: false,
    });
  }
};

export { generateAccessTokenRefreshToken };
