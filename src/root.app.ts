/* eslint-disable import/no-named-as-default-member */
import path from 'path';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express, { Application, urlencoded } from 'express';

// Route imports
import { ErrorHandler } from '@middlewares/error.handler.middleware';
import { PortfolioRouter } from '@routes/portfolio-routes/portfolio.routes';
import { UserRouter } from '@routes/user-routes/user.routes';

import { PORTFOLIO_API_ROUTE, USER_API_ROUTE } from './app.constants';

const app: Application = express();

// For env File
config({
  path: path.join(__dirname, '../.env'),
});

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

app.use(express.json({ limit: '16kb' }));
app.use(urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// ============================== Portfolio routes =============================
app.use(PORTFOLIO_API_ROUTE, PortfolioRouter);

// ============================== React Apps Routes ===================
// passkeys app
app.use(USER_API_ROUTE, UserRouter);

// Middleware imports

// middleware
app.use(ErrorHandler);

export { app };
