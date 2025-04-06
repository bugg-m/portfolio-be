import { generateRegistrationOptions } from '@simplewebauthn/server';
import { Response } from 'express';

import { Message } from '@constants/message-constants/message.constants';
import { StatusCode } from '@constants/status-code-constants/statusCode.constants';
import * as Auth from '@middlewares/auth.middleware';
import { ApiError } from '@utils/api.error';
import { ApiResponse } from '@utils/api.response';
import { asyncControllerHandler } from '@utils/async.handler';

const getPasskeyChallenge = asyncControllerHandler(async (req: Auth.UserRequest, res: Response) => {
  const user = req?.user;

  if (!user) {
    throw new ApiError({
      statusCode: StatusCode.NOT_FOUND,
      message: Message.USER_NOT_FOUND,
      status: false,
    });
  }

  const challengeResponse = await generateRegistrationOptions({
    rpID: process.env.PASSKEY_RP_ID ?? '',
    rpName: process.env.PASSKEY_RP_NAME ?? '',
    userName: user.username,
    userDisplayName: user.username,
    timeout: 60000,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
  });

  if (!challengeResponse) {
    throw new ApiError({
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
      message: Message.SOMETHING_WENT_WRONG_TRY_AGAIN,
      status: false,
    });
  }

  user.passkeyCredentials = {
    ...user.passkeyCredentials,
    passkeyChallenge: challengeResponse.challenge,
  };

  await user.save();

  res.status(StatusCode.OK).json(
    new ApiResponse({
      statusCode: StatusCode.OK,
      message: Message.CHALLENGE_CREATED,
      data: challengeResponse,
      status: true,
    })
  );
});

export { getPasskeyChallenge };
