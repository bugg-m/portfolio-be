import {
  generateRegistrationOptions,
  RegistrationResponseJSON,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { Response } from 'express';

import { RequestWithBody } from '@/types/app.types';
import { Message } from '@constants/message-constants/message.constants';
import { StatusCode } from '@constants/status-code-constants/statusCode.constants';
import { ApiError } from '@utils/api.error';
import { ApiResponse } from '@utils/api.response';
import { asyncControllerHandler } from '@utils/async.handler';

const getPasskeyChallenge = asyncControllerHandler(async (req: RequestWithBody, res: Response) => {
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
    challenge: challengeResponse.challenge,
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

interface ChallengeBodyType {
  challenge: RegistrationResponseJSON;
}

const verifyPasskey = asyncControllerHandler(
  async (req: RequestWithBody<ChallengeBodyType>, res: Response) => {
    const user = req?.user;

    if (!user) {
      throw new ApiError({
        statusCode: StatusCode.NOT_FOUND,
        message: Message.USER_NOT_FOUND,
        status: false,
      });
    }

    const verificationResponse = await verifyRegistrationResponse({
      expectedChallenge: user.passkeyCredentials.challenge,
      expectedOrigin: process.env.PASSKEY_ORIGIN ?? '',
      expectedRPID: process.env.PASSKEY_RP_ID ?? '',
      response: req.body.challenge,
    });

    if (!verificationResponse.verified) {
      throw new ApiError({
        statusCode: StatusCode.CONFLICT,
        message: Message.COULD_NOT_VERIFY,
        status: false,
      });
    }

    user.passkeyCredentials = {
      ...user.passkeyCredentials,
      publicKey: verificationResponse.registrationInfo?.credential.publicKey ?? '',
    };

    await user.save();

    res.status(StatusCode.OK).json(
      new ApiResponse({
        statusCode: StatusCode.OK,
        message: Message.USER_VERIFIED,
        status: true,
      })
    );
  }
);

export { getPasskeyChallenge, verifyPasskey };
