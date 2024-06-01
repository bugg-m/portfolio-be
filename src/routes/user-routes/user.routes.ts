import { Router } from "express";
import { upload } from "@middlewares/multer.middleware";
import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateUserAvatar
} from "@controllers/user-controllers/user.controllers";
import { UserRouteNames } from "@constants/route-constants/user.routenames";
import { verifyJWT } from "@middlewares/auth.middleware";
const UserRouter = Router();

// ====================== user routes ======================

UserRouter.route(UserRouteNames.REGISTER_USER).post(upload.single("avatar"), registerUser);
UserRouter.route(UserRouteNames.LOGIN_USER).post(loginUser);
UserRouter.route(UserRouteNames.UPDATE_USER_AVATAR).put(upload.single("avatar"), updateUserAvatar);

// ====================== secure routes ======================
UserRouter.route(UserRouteNames.LOGOUT_USER).post(verifyJWT, logoutUser);
UserRouter.route(UserRouteNames.REFRESH_ACCESS_TOKEN).post(refreshAccessToken);
// ====================== secure routes ======================

// ====================== user routes ======================

export { UserRouter };
