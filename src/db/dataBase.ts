import { DB_NAME } from "app.constants";
import mongoose from "mongoose";

const connectDatabase = async () => {
    try {
        const mongoDBInstance = await mongoose.connect(`${process.env.MONGODB_ATLAS_URI}/${DB_NAME}`);
        console.log(`\nMongoDB connected || DB Host: ${mongoDBInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error", error);
        process.exit(1);
    }
};

export default connectDatabase;
