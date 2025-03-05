import { Router } from "express";
import { PortfolioRoutes } from "@src/constants/route-constants/portfolio.routenames";
import * as Portfolio from "@src/controllers/portfolio-controllers/portfolio.controllers";

const PortfolioRouter = Router();

// ====================== portfolio routes ======================
PortfolioRouter.route(PortfolioRoutes.GITHUB_PROJECTS).get(Portfolio.getGithubProjects);
PortfolioRouter.route(PortfolioRoutes.SEND_MESSAGE).post(Portfolio.sendMessage);

export { PortfolioRouter };
