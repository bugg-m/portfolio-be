import { Router } from 'express';

import { UserRouteNames } from '@constants/route-constants/user.routenames';
import * as Passkey from '@controllers/user-controllers/passkey.controllers';
import * as UserAuth from '@controllers/user-controllers/user.controllers';
import { verifyJWT } from '@middlewares/auth.middleware';
import { upload } from '@middlewares/multer.middleware';

const UserRouter = Router();

// ====================== user routes ======================
UserRouter.route(UserRouteNames.REGISTER_USER).post(UserAuth.registerUser);
UserRouter.route(UserRouteNames.LOGIN_USER).post(UserAuth.loginUser);
UserRouter.route(UserRouteNames.UPDATE_USER_AVATAR).put(
  upload.single('avatar'),
  UserAuth.updateUserAvatar
);

// ====================== secure routes ======================
UserRouter.route(UserRouteNames.LOGOUT_USER).post(verifyJWT, UserAuth.logoutUser);
UserRouter.route(UserRouteNames.GET_REGISTER_CHALLENGE).get(
  verifyJWT,
  Passkey.getPasskeyRegistrationChallenge
);
UserRouter.route(UserRouteNames.GET_LOGIN_CHALLENGE).get(
  verifyJWT,
  Passkey.getLoginPasskeyChallenge
);
UserRouter.route(UserRouteNames.CREATE_PASSKEY).post(
  verifyJWT,
  Passkey.verifyPasskeyRegistrationResponse
);
UserRouter.route(UserRouteNames.LOGIN_WITH_PASSKEY).post(
  verifyJWT,
  Passkey.verifyPasskeyAuthenticationResponse
);
UserRouter.route(UserRouteNames.GET_USER_DETAILS).get(verifyJWT, UserAuth.getUserDetails);
UserRouter.route(UserRouteNames.REFRESH_ACCESS_TOKEN).post(UserAuth.refreshAccessToken);
// ====================== secure routes ======================

export { UserRouter };
