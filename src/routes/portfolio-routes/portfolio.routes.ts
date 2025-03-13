import { Router } from 'express';

import { PortfolioRoutes } from '@constants/route-constants/portfolio.routenames';
import * as Portfolio from '@controllers/portfolio-controllers/portfolio.controllers';
import { upload } from '@middlewares/multer.middleware';

const PortfolioRouter = Router();

// ====================== portfolio routes ======================

// get routes
PortfolioRouter.route(PortfolioRoutes.GITHUB_PROJECTS).get(Portfolio.getGithubProjects);
PortfolioRouter.route(PortfolioRoutes.DOWNLOAD_CV).get(Portfolio.downloadCV);

// post routes
PortfolioRouter.route(PortfolioRoutes.REGISTER_ADMIN).post(Portfolio.registerAdmin);
PortfolioRouter.route(PortfolioRoutes.LOGIN_ADMIN).post(Portfolio.loginAdmin);
PortfolioRouter.route(PortfolioRoutes.SEND_MESSAGE).post(Portfolio.sendMessage);
PortfolioRouter.route(PortfolioRoutes.UPLOAD_CV).post(upload.single('cv'), Portfolio.uploadCV);

// patch routes
PortfolioRouter.route(PortfolioRoutes.UPDATE_USER_AVATAR).patch(
  upload.single('avatar'),
  Portfolio.updateAdminAvatar
);

export { PortfolioRouter };
