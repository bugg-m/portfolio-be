import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./apiError";
import { StatusCode } from "@constants/status-code-constants/statusCode.constants";
import { Message } from "@constants/message-constants/message.constants";

interface CloudinaryConfig {
    cloud_name?: string;
    api_key?: string;
    api_secret?: string;
}

interface CloudinaryUploadResponse {
    public_id: string;
    version: number;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: string[];
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    original_filename: string;
}

// Define the type for the Cloudinary upload function
type CloudinaryUploadFunction = (localFilePath: string) => Promise<CloudinaryUploadResponse | null>;

// Define the Cloudinary configuration options
const cloudinaryConfig: CloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};

// Configure Cloudinary
cloudinary.config(cloudinaryConfig);

// Define the upload function with proper TypeScript types
const uploadFileOnCloudinary: CloudinaryUploadFunction = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response: CloudinaryUploadResponse = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        const ErrorResponse = {
            statusCode: StatusCode.UNAUTHORIZED,
            message: Message.INVALID_TOKEN,
            success: false
        };
        throw new ApiError(ErrorResponse);
    }
};

export default uploadFileOnCloudinary;
