import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { NotAuthorizedError } from '../errors/not-authorised-error';

interface UserPayload {
  id: string;
  email: string;
  accessToken: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!) as UserPayload;

    req.currentUser = { ...payload, accessToken: req.session.jwt };

  } catch (err) {
    throw new NotAuthorizedError();
  }

  next();
};