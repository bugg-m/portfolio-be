import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

import { UserDocument } from './user.types';
interface JwtPayloadWithId extends JwtPayload {
  _id?: string;
}

type RequestWithBody<
  TBody = unknown,
  TParams = object,
  TQuery = object,
  TUser = UserDocument,
> = Omit<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Request<TParams, any, TBody, TQuery>,
  'body'
> & {
  user?: TUser;
  body: TBody;
};

export { type JwtPayloadWithId, type RequestWithBody };
