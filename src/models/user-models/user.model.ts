import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as UserTypes from "@src/types/user.types";

// Define the schema for the user
const userSchema = new Schema<UserTypes.UserDocument, UserTypes.UserModel>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },
        fullname: {
            type: String,
            required: true,
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
userSchema.pre<UserTypes.UserDocument>("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to check if the provided password is correct
userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

// Method to generate access token
userSchema.methods.generateAccessToken = async function (): Promise<string> {
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
userSchema.methods.generateRefreshToken = async function (): Promise<string> {
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
export const User = mongoose.model<UserTypes.UserDocument, UserTypes.UserModel>("User", userSchema);
