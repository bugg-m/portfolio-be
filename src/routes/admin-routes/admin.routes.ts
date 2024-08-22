import { Router } from "express";
import { AdminRouteNames } from "@constants/route-constants/admin.routenames";
import * as AdminAuth from "@controllers/admin-controllers/admin.controllers";
import { verifyJWT } from "@middlewares/auth.middleware";

const AdminRouter = Router();

// ====================== admin routes ======================
AdminRouter.route(AdminRouteNames.REGISTER).post(AdminAuth.registerAdmin);
AdminRouter.route(AdminRouteNames.LOGIN).post(AdminAuth.loginAdmin);
AdminRouter.route(AdminRouteNames.GET_SUMMARY).get(AdminAuth.getAdminSummary);
AdminRouter.route(AdminRouteNames.REFRESH_ACCESS_TOKEN).post(AdminAuth.refreshAdminAccessToken);
AdminRouter.route(AdminRouteNames.GITHUB_PROJECTS).get(AdminAuth.getAdminProjects);

// ====================== secure routes ======================
AdminRouter.route(AdminRouteNames.LOGOUT).post(verifyJWT, AdminAuth.logoutAdmin);

export { AdminRouter };
