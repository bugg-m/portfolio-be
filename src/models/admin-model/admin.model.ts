import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as AuthTypes from "@src/types/admin.types";

// Define the schema for the user
const adminSchema = new Schema<AuthTypes.AdminDocument, AuthTypes.AdminModel>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },
        adminSecret: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        refreshToken: {
            type: String
        },
        password: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Pre-save hook to hash the password before saving
adminSchema.pre<AuthTypes.AdminDocument>("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});
// Pre-save hook to hash the adminSecret before saving
adminSchema.pre<AuthTypes.AdminDocument>("save", async function (next) {
    if (!this.isModified("adminSecret")) return next();

    this.adminSecret = await bcrypt.hash(this.adminSecret, 10);
    next();
});

// Method to check if the provided password is correct
adminSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};
// Method to check if the provided adminSecret is correct
adminSchema.methods.isAdminSecretCorrect = async function (adminSecret: string): Promise<boolean> {
    return await bcrypt.compare(adminSecret, this.adminSecret);
};

// Method to generate access token
adminSchema.methods.generateAccessToken = async function (): Promise<string> {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET ?? "",
        {
            expiresIn: process.env.ACCESS_TOKEN_LIFETIME
        }
    );
};

// Method to generate refresh token
adminSchema.methods.generateRefreshToken = async function (): Promise<string> {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET ?? "",
        {
            expiresIn: process.env.REFRESH_TOKEN_LIFETIME
        }
    );
};

// Create and export the model
export const Admin = mongoose.model<AuthTypes.AdminDocument, AuthTypes.AdminModel>("Admin", adminSchema);
