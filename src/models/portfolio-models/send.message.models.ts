import { SendMessageDocument, SendMessageModel } from "@src/types/portfolio-types/contact.types";
import mongoose from "mongoose";

const sendMessageSchema = new mongoose.Schema<SendMessageDocument, SendMessageModel>(
    {
        name: {
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
        messages: [
            {
                message: { type: String, required: true, trim: true },
                time: { type: Date, default: Date.now }
            }
        ]
    },
    {
        timestamps: true
    }
);

export const SendMessage = mongoose.model<SendMessageDocument, SendMessageModel>("SendMessage", sendMessageSchema);
