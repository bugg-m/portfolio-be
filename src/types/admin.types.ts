import { Model, Document } from "mongoose";

export type RegisterAdminRequestBody = {
    username: string;
    adminSecret: string;
    email: string;
    password: string;
};

export interface AdminDocument extends Document {
    _id: string;
    username: string;
    adminSecret: string;
    email: string;
    password: string;
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;

    isPasswordCorrect(password: string): Promise<boolean>;

    isAdminSecretCorrect(password: string): Promise<boolean>;

    generateAccessToken(): Promise<string>;

    generateRefreshToken(): Promise<string>;
}

export interface AdminModel extends Model<AdminDocument> {}
