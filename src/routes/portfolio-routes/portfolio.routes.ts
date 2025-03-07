import { Router } from "express";
import { PortfolioRoutes } from "@src/constants/route-constants/portfolio.routenames";
import * as Portfolio from "@src/controllers/portfolio-controllers/portfolio.controllers";
import { upload } from "@src/middlewares/multer.middleware";

const PortfolioRouter = Router();

// ====================== portfolio routes ======================

// get routes
PortfolioRouter.route(PortfolioRoutes.GITHUB_PROJECTS).get(Portfolio.getGithubProjects);
PortfolioRouter.route(PortfolioRoutes.DOWNLOAD_CV).get(Portfolio.downloadCV);

// post routes
PortfolioRouter.route(PortfolioRoutes.REGISTER_ADMIN).post(Portfolio.registerAdmin);
PortfolioRouter.route(PortfolioRoutes.LOGIN_ADMIN).post(Portfolio.loginAdmin);
PortfolioRouter.route(PortfolioRoutes.SEND_MESSAGE).post(Portfolio.sendMessage);
PortfolioRouter.route(PortfolioRoutes.UPLOAD_CV).post(upload.single("cv"), Portfolio.uploadCV);

// patch routes
PortfolioRouter.route(PortfolioRoutes.UPDATE_USER_AVATAR).patch(Portfolio.updateAdminAvatar);

export { PortfolioRouter };
