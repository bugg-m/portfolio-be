import jwt from "jsonwebtoken";

export type ProcessEnv = {
    FRONTEND_URL1: string;
};

export type SSLOptions = {
    key: Buffer;
    cert: Buffer;
};

export type StringObjectTypes = {
    [key: string]: string;
};

export type NumberObjectTypes = {
    [key: string]: number;
};

export interface JwtPayloadWithId extends jwt.JwtPayload {
    _id?: string;
}
