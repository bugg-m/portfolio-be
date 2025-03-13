import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

import { JwtPayloadWithId } from '@/types/app.types';
import { UserDocument } from '@/types/user.types';
import { Message } from '@constants/message-constants/message.constants';
import { StatusCode } from '@constants/status-code-constants/statusCode.constants';
import { User } from '@models/user-models/user.model';
import { ApiError } from '@utils/apiError';
import { asyncTryCatchHandler } from '@utils/asyncHandlers';

export interface UserRequest extends Request {
  user?: UserDocument;
}
const verifyJWT = asyncTryCatchHandler(
  async (req: UserRequest, _: Response, next: NextFunction) => {
    try {
      const token = String(
        req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '')
      );

      if (!token) {
        throw new ApiError({
          statusCode: StatusCode.UNAUTHORIZED,
          message: Message.INVALID_TOKEN,
          status: false,
        });
      }

      const decodedToken = verify(token, process.env.ACCESS_TOKEN_SECRET ?? '') as JwtPayloadWithId;

      const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

      if (!user) {
        throw new ApiError({
          statusCode: StatusCode.UNAUTHORIZED,
          message: Message.INVALID_TOKEN,
          status: false,
        });
      }

      req.user = user;
      next();
    } catch (error) {
      throw new ApiError({
        statusCode: StatusCode.UNAUTHORIZED,
        message: Message.INVALID_TOKEN,
        status: false,
      });
    }
  }
);

export { verifyJWT };
