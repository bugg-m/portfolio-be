import { Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

import { JwtPayloadWithId, RequestWithBody } from '@/types/app.types';
import { Message } from '@constants/message-constants/message.constants';
import { StatusCode } from '@constants/status-code-constants/statusCode.constants';
import { User } from '@models/user-models/user.model';
import { ApiError } from '@utils/api.error';
import { asyncMiddlewareHandler } from '@utils/async.handler';

const verifyJWT = asyncMiddlewareHandler(
  async (req: RequestWithBody, _: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken as string | undefined;
    const authHeader = req.header('Authorization');
    const bearerToken = authHeader ? authHeader.replace('Bearer ', '') : undefined;
    const token = accessToken || bearerToken;

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
  }
);

export { verifyJWT };
