import mongoose from 'mongoose';

import { PasskeysDocument } from '@/types/user.types';

const PasskeysSchema = new mongoose.Schema<PasskeysDocument>(
  {
    challenge: {
      type: String,
    },
    publicKey: {
      type: String,
    },
    counter: {
      type: Number,
    },
    displayName: {
      type: String,
    },
    createdAt: { type: Date, default: Date.now, index: { expires: '30d' } },
  },
  {
    timestamps: true,
  }
);

export { PasskeysSchema };
