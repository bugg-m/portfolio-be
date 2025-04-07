import { Router } from 'express';

import { UserRouteNames } from '@constants/route-constants/user.routenames';
import {
  getPasskeyChallenge,
  verifyPasskey,
} from '@controllers/user-controllers/passkey.controllers';
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
UserRouter.route(UserRouteNames.GET_PASSKEY_CHALLENGE).get(verifyJWT, getPasskeyChallenge);
UserRouter.route(UserRouteNames.VERIFY_USER).get(verifyJWT, verifyPasskey);
UserRouter.route(UserRouteNames.REFRESH_ACCESS_TOKEN).post(UserAuth.refreshAccessToken);
// ====================== secure routes ======================

export { UserRouter };
