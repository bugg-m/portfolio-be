import { Router } from "express";
// import { verifyJWT } from "@middlewares/auth.middleware";
import { AdminRouteNames } from "@constants/route-constants/admin.routenames";
import { getAdminSummary } from "@controllers/admin-controllers/admin.controllers";

const AdminRouter = Router();

// ====================== user routes ======================

AdminRouter.route(AdminRouteNames.GET_SUMMARY).get(getAdminSummary);

// ====================== secure routes ======================
// AdminRouter.route(AdminRouteNames.LOGOUT_USER).post(verifyJWT, logoutUser);
// AdminRouter.route(AdminRouteNames.REFRESH_ACCESS_TOKEN).post(refreshAccessToken);

export { AdminRouter };
