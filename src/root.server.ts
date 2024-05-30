import connectDatabase from "@db/dataBase";
import { app } from "root.app";

const PORT = process.env.PORT || 4000;

connectDatabase()
    .then(() => {
        app.on("connection", (error) => {
            console.log("ERROR:", error);
            throw error;
        });
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB connection failed", error);
    });
