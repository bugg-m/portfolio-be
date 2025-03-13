import { Document, Model } from 'mongoose';

import { UserRequestBodyTypes } from '../user.types';

export interface CVRequestBodyTypes {
  fileName: string;
  filePath: string;
}

export interface CVDocument {
  public_id: string;
  url: string;

  originalName: string;
}

export interface AdminRequestBodyTypes extends UserRequestBodyTypes {
  secretToken: string;
}

export interface AdminDocument extends Document {
  _id: string;
  username: string;
  fullname: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  secretToken: string;
  cvDownloadCount: number;
  myCV: CVDocument;

  isPasswordCorrect(password: string): Promise<boolean>;

  isSecretTokenCorrect(token: string): Promise<boolean>;
}

export interface AdminModel extends Model<AdminDocument> {}
