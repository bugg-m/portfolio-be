import fs from 'fs';

import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

import { ApiError } from './api.error';

interface CloudinaryConfig {
  cloud_name?: string;
  api_key?: string;
  api_secret?: string;
}

const cloudinaryConfig: CloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

cloudinary.config(cloudinaryConfig);

const uploadFileOnCloudinary = async (localFilePath: string): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: 'portfolio',
      resource_type: 'auto',
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error: unknown) {
    fs.unlinkSync(localFilePath);

    let statusCode: number = 500;
    let message = 'An unknown error occurred';

    if (error && typeof error === 'object') {
      const err = error as { http_code?: number; message?: string };
      statusCode = err.http_code ?? 500;
      message = err.message ?? message;
    }
    throw new ApiError({
      statusCode,
      message,
      status: false,
    });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deleteFileOnCloudinary = async (publicId: string): Promise<any> => {
  try {
    if (!publicId) return null;
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
  } catch (error) {
    return null;
  }
};

export { uploadFileOnCloudinary, deleteFileOnCloudinary };
