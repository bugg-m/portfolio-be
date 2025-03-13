import { Model, Document } from 'mongoose';

export interface UserRequestBodyTypes {
  username: string;
  fullname?: string;
  email: string;
  password: string;
}

export interface UserDocument extends Document {
  _id: string;
  username: string;
  fullname: string;
  email: string;
  password: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;

  isPasswordCorrect(password: string): Promise<boolean>;

  generateAccessToken(): Promise<string>;

  generateRefreshToken(): Promise<string>;
}

export interface UserModel extends Model<UserDocument> {}
