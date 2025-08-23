import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors/not-authorised-error';

export const requireRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction) => {
  if (!req.session?.refresh) {
    throw new NotAuthorizedError();
  }

  next();
};