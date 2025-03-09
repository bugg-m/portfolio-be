import jwt from 'jsonwebtoken';

export interface SSLOptions {
  key: Buffer;
  cert: Buffer;
}

export interface JwtPayloadWithId extends jwt.JwtPayload {
  _id?: string;
}
