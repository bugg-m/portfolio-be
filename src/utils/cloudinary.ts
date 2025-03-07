import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

interface CloudinaryConfig {
  cloud_name?: string;
  api_key?: string;
  api_secret?: string;
}

interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  secure_url: string;
  original_filename: string;
}

type CloudinaryUploadFunction = (localFilePath: string) => Promise<CloudinaryUploadResponse | null>;

const cloudinaryConfig: CloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

cloudinary.config(cloudinaryConfig);

const uploadFileOnCloudinary: CloudinaryUploadFunction = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response: CloudinaryUploadResponse = await cloudinary.uploader.upload(localFilePath, {
      folder: "portfolio",
      resource_type: "auto"
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFileOnCloudinary: CloudinaryUploadFunction = async (publicId) => {
  try {
    if (!publicId) return null;
    const response: CloudinaryUploadResponse = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image"
    });
    return response;
  } catch (error) {
    return null;
  }
};

export { uploadFileOnCloudinary, deleteFileOnCloudinary };
