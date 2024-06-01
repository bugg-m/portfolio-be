import express, { Application, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import fs from "fs";
import https from "https";
import path from "path";

const app: Application = express();

// For env File
dotenv.config({
    path: path.join(__dirname, "../.env")
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

// SSL options
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, "../localhost+2-key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "../localhost+2.pem"))
};

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

// Route imports
import { ADMIN_API_ROUTE, USER_API_ROUTE } from "app.constants";
import { UserRouter } from "@routes/user-routes/user.routes";
import { AdminRouter } from "@routes/admin-routes/admin.routes";

// ============================== Admin routes =============================
app.use(ADMIN_API_ROUTE, AdminRouter);

// ============================== Mini React Apps Routes ===================
// passkeys app
app.use(USER_API_ROUTE, UserRouter);

export { app, httpsServer };
