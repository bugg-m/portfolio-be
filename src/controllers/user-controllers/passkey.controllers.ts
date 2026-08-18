import {
  AuthenticationResponseJSON,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  RegistrationResponseJSON,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { Response } from 'express';

import { RequestWithBody } from '@/types/app.types';
import { RegistrationInfoDocument } from '@/types/user.types';
import { options } from '@constants/app.constants';
import { Message } from '@constants/message-constants/message.constants';
import { StatusCode } from '@constants/status-code-constants/statusCode.constants';
import { User } from '@models/user-models/user.model';
import { ApiError } from '@utils/api.error';
import { ApiResponse } from '@utils/api.response';
import { asyncControllerHandler } from '@utils/async.handler';
import { generateAccessTokenRefreshToken } from '@utils/generate-tokens';

interface ChallengeBodyType {
  registrationResponse: RegistrationResponseJSON;
  authenticationResponse: AuthenticationResponseJSON;
}

const getPasskeyRegistrationChallenge = asyncControllerHandler(
  async (req: RequestWithBody, res: Response) => {
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
      registerChallenge: challengeResponse.challenge,
      displayName: challengeResponse.user.displayName,
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
  }
);

const verifyPasskeyRegistrationResponse = asyncControllerHandler(
  async (req: RequestWithBody<ChallengeBodyType>, res: Response) => {
    const user = req?.user;

    if (!user) {
      throw new ApiError({
        statusCode: StatusCode.NOT_FOUND,
        message: Message.USER_NOT_FOUND,
        status: false,
      });
    }

    const registrationResponse = req.body.registrationResponse;

    if (!registrationResponse) {
      throw new ApiError({
        statusCode: StatusCode.NOT_FOUND,
        message: Message.SOMETHING_WENT_WRONG_TRY_AGAIN,
        status: false,
      });
    }

    const verificationResponse = await verifyRegistrationResponse({
      expectedChallenge: user.passkeyCredentials.registerChallenge,
      expectedOrigin: process.env.PASSKEY_ORIGIN ?? '',
      expectedRPID: process.env.PASSKEY_RP_ID ?? '',
      response: registrationResponse,
    });

    if (!verificationResponse.verified) {
      throw new ApiError({
        statusCode: StatusCode.CONFLICT,
        message: Message.COULD_NOT_VERIFY_CHALLENGE,
        status: false,
      });
    }

    user.passkeyCredentials = {
      ...user.passkeyCredentials,
      registrationInfo: (verificationResponse.registrationInfo ?? {}) as RegistrationInfoDocument,
    };

    await user.save();

    res.status(StatusCode.OK).json(
      new ApiResponse({
        statusCode: StatusCode.OK,
        message: Message.PASSKEY_CREATED,
        status: true,
      })
    );
  }
);

const getLoginPasskeyChallenge = asyncControllerHandler(
  async (req: RequestWithBody<ChallengeBodyType>, res: Response) => {
    const user = req?.user;

    if (!user) {
      throw new ApiError({
        statusCode: StatusCode.NOT_FOUND,
        message: Message.USER_NOT_FOUND,
        status: false,
      });
    }

    const authenticationOptions = await generateAuthenticationOptions({
      rpID: process.env.PASSKEY_RP_ID ?? '',
    });

    if (!authenticationOptions) {
      throw new ApiError({
        statusCode: StatusCode.CONFLICT,
        message: Message.SOMETHING_WENT_WRONG,
        status: false,
      });
    }

    user.passkeyCredentials = {
      ...user.passkeyCredentials,
      loginChallenge: authenticationOptions.challenge ?? '',
    };

    await user.save();

    res.status(StatusCode.OK).json(
      new ApiResponse({
        statusCode: StatusCode.OK,
        message: Message.CHALLENGE_CREATED,
        data: authenticationOptions,
        status: true,
      })
    );
  }
);

const verifyPasskeyAuthenticationResponse = asyncControllerHandler(
  async (req: RequestWithBody<ChallengeBodyType>, res: Response) => {
    const user = req?.user;

    if (!user) {
      throw new ApiError({
        statusCode: StatusCode.NOT_FOUND,
        message: Message.USER_NOT_FOUND,
        status: false,
      });
    }

    const authenticationResponse = req.body.authenticationResponse;

    if (!authenticationResponse) {
      throw new ApiError({
        statusCode: StatusCode.NOT_FOUND,
        message: Message.SOMETHING_WENT_WRONG_TRY_AGAIN,
        status: false,
      });
    }

    const verificationResponse = await verifyAuthenticationResponse({
      expectedChallenge: user.passkeyCredentials.loginChallenge,
      expectedOrigin: process.env.PASSKEY_ORIGIN ?? '',
      expectedRPID: process.env.PASSKEY_RP_ID ?? '',
      response: authenticationResponse,
      credential: {
        id: user.passkeyCredentials.registrationInfo.credential.id,
        publicKey: user.passkeyCredentials.registrationInfo.credential.publicKey,
        counter: user.passkeyCredentials.registrationInfo.credential.counter,
        transports: user.passkeyCredentials.registrationInfo.credential.transports,
      },
    });

    if (!verificationResponse.verified) {
      throw new ApiError({
        statusCode: StatusCode.CONFLICT,
        message: Message.COULD_NOT_VERIFY_CHALLENGE,
        status: false,
      });
    }

    const { accessToken, refreshToken } = await generateAccessTokenRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      '-password -refreshToken -passkeyCredentials'
    );

    if (!loggedInUser) {
      throw new ApiError({
        statusCode: StatusCode.INTERNAL_SERVER_ERROR,
        message: Message.SOMETHING_WENT_WRONG_TRY_AGAIN,
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

export {
  getPasskeyRegistrationChallenge,
  verifyPasskeyRegistrationResponse,
  getLoginPasskeyChallenge,
  verifyPasskeyAuthenticationResponse,
};
