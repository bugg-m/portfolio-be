import express, { Application, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

const app: Application = express();

//For env File
dotenv.config({
    path: `${__dirname}/../.env`
});

app.use(
    cors({
        origin: process.env.FRONTEND_URL1,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Authorization"],
        optionsSuccessStatus: 200
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Route imports
import { UserRouter } from "@routes/user-routes/user.routes";
import { USER_API_ROUTE } from "app.constants";

// ============================== Mini React Apps Routes ==================================

// passkeys app
app.use(USER_API_ROUTE, UserRouter);

// ============================== Mini React Apps Routes ==================================
export { app };
