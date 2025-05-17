import mongoose from 'mongoose';

import { PasskeysDocument } from '@/types/user.types';

const PasskeysSchema = new mongoose.Schema<PasskeysDocument>(
  {
    registerChallenge: {
      type: String,
    },
    loginChallenge: {
      type: String,
    },

    registrationInfo: {
      fmt: { type: String },
      aaguid: { type: String },
      credential: {
        id: {
          type: String,
        },
        publicKey: {
          type: String,
        },
        counter: {
          type: Number,
        },
        transports: {
          type: [String],
        },
      },
      credentialType: {
        type: String,
      },
      attestationObject: { type: String },
      userVerified: { type: Boolean },
      credentialDeviceType: {
        type: String,
      },
      credentialBackedUp: {
        type: Boolean,
      },
      origin: {
        type: String,
      },
      rpID: {
        type: String,
      },
      authenticatorExtensionResults: {
        type: String,
      },
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
