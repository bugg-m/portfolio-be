import mongoose from 'mongoose';

import { SendMessageDocument, SendMessageModel } from '@/types/portfolio-types/contact.types';

const sendMessageSchema = new mongoose.Schema<SendMessageDocument, SendMessageModel>(
  {
    name: {
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
    messages: [
      {
        message: { type: String, required: true, trim: true },
        time: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const SendMessage = mongoose.model<SendMessageDocument, SendMessageModel>(
  'SendMessage',
  sendMessageSchema
);
