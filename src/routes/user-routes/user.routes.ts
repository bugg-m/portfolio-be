import { Router } from "express";
import { upload } from "@middlewares/multer.middleware";
import * as UserAuth from "@controllers/user-controllers/user.controllers";
import { UserRouteNames } from "@constants/route-constants/user.routenames";
import { verifyJWT } from "@middlewares/auth.middleware";

const UserRouter = Router();

// ====================== user routes ======================
UserRouter.route(UserRouteNames.REGISTER_USER).post(upload.single("avatar"), UserAuth.registerUser);
UserRouter.route(UserRouteNames.LOGIN_USER).post(UserAuth.loginUser);
UserRouter.route(UserRouteNames.UPDATE_USER_AVATAR).put(upload.single("avatar"), UserAuth.updateUserAvatar);

// ====================== secure routes ======================
UserRouter.route(UserRouteNames.LOGOUT_USER).post(verifyJWT, UserAuth.logoutUser);
UserRouter.route(UserRouteNames.REFRESH_ACCESS_TOKEN).post(UserAuth.refreshAccessToken);
// ====================== secure routes ======================

export { UserRouter };
