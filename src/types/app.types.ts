import { JwtPayload } from 'jsonwebtoken';

export interface JwtPayloadWithId extends JwtPayload {
  _id?: string;
}
