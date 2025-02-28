import jwt from "jsonwebtoken";

export type SSLOptions = {
    key: Buffer;
    cert: Buffer;
};

export interface JwtPayloadWithId extends jwt.JwtPayload {
    _id?: string;
}
