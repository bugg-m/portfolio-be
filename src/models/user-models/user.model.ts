import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import mongoose, { Schema } from 'mongoose';

import { UserDocument, UserModel } from '@/types/user.types';

import { PasskeysSchema } from './passkeys.model';

// Define the schema for the user
const userSchema = new Schema<UserDocument, UserModel>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    refreshToken: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    passkeyCredentials: PasskeysSchema,
    createdAt: { type: Date, default: Date.now, index: { expires: '30d' } },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash the password before saving
userSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await hash(this.password, 10);
  next();
});

// Method to check if the provided password is correct
userSchema.methods.isPasswordCorrect = async function (
  this: UserDocument,
  password: string
): Promise<boolean> {
  return await compare(password, this.password);
};

// Method to generate access token
userSchema.methods.generateAccessToken = function (this: UserDocument): string {
  return sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET ?? '',
    {
      expiresIn: process.env.ACCESS_TOKEN_LIFETIME,
    }
  );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function (this: UserDocument): string {
  return sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET ?? '',
    {
      expiresIn: process.env.REFRESH_TOKEN_LIFETIME,
    }
  );
};

// Create and export the model
export const User = mongoose.model<UserDocument, UserModel>('User', userSchema);
