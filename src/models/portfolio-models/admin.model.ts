import { hash, compare } from 'bcrypt';
import mongoose from 'mongoose';

import { AdminDocument, AdminModel } from '@/types/portfolio-types/admin.types';

const adminSchema = new mongoose.Schema<AdminDocument, AdminModel>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    secretToken: {
      type: String,
    },
    myCV: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
      originalName: { type: String },
    },
    cvDownloadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash the password before saving
adminSchema.pre<AdminDocument>('save', async function (next) {
  if (!this.isModified('password secretToken')) return next();

  this.password = await hash(this.password, 10);
  this.secretToken = await hash(this.secretToken, 10);
  next();
});

// Method to check if the provided password is correct
adminSchema.methods.isPasswordCorrect = async function (
  this: AdminDocument,
  password: string
): Promise<boolean> {
  return await compare(password, this.password);
};

// Method to check if the provided secretToken is correct
adminSchema.methods.isSecretTokenCorrect = async function (
  this: AdminDocument,
  token: string
): Promise<boolean> {
  return await compare(token, this.secretToken);
};

export const Admin = mongoose.model<AdminDocument, AdminModel>('Admin', adminSchema);
