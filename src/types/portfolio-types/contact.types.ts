import { Document, Model } from 'mongoose';

export interface SendMessageRequestBodyTypes {
  name: string;
  email: string;
  message: string;
}

export interface SendMessageDocument extends Document {
  _id: string;
  name: string;
  email: string;
  messages: [
    {
      message: string;
      time: Date;
    },
  ];
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageModel extends Model<SendMessageDocument> {}
