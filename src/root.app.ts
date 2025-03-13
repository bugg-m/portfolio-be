import path from 'path';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
// For env File
config({
  path: path.join(__dirname, '../.env'),
});
import express, { Application, json, urlencoded, static as static_ } from 'express';

import { ErrorHandler } from '@middlewares/error.handler.middleware';
import { PortfolioRouter } from '@routes/portfolio-routes/portfolio.routes';
import { UserRouter } from '@routes/user-routes/user.routes';

import { PORTFOLIO_API_ROUTE, USER_API_ROUTE } from './app.constants';

const app: Application = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200,
  })
);

app.use(json({ limit: '16kb' }));
app.use(urlencoded({ extended: true, limit: '16kb' }));
app.use(static_('public'));
app.use(cookieParser());

// ============================== Portfolio routes =============================
app.use(PORTFOLIO_API_ROUTE, PortfolioRouter);

// ============================== React Apps Routes ===================
// passkeys app
app.use(USER_API_ROUTE, UserRouter);

// middleware
app.use(ErrorHandler);

export { app };
