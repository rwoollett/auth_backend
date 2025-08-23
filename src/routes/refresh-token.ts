import express, { NextFunction, Request, Response } from 'express';
import { requireRefreshToken } from '../middlewares/require-refresh';
import jwt from 'jsonwebtoken';
import { NotAuthorizedError } from '../errors/not-authorised-error';
const router = express.Router();

interface UserPayload {
  id: string;
  email: string;
}

router.post(
  '/api/users/refreshtoken',
  requireRefreshToken,
  async (req: Request, res: Response) => {

    try {
      const payload = jwt.verify(
        req.session?.refresh,
        process.env.JWT_REFRESH_KEY!) as UserPayload;

      const userPayload = {
        id: payload.id,
        email: payload.email
      };

      const userJwt = jwt.sign(
        userPayload,
        process.env.JWT_KEY!,
        { expiresIn: '15m' }
      );

      // Store on session object (refresh token cookie)
      const refreshToken = req.session?.refresh;
      req.session = {
        refresh: refreshToken,
        jwt: userJwt
      };

      res.status(200).send();

    } catch (err) {
      throw new NotAuthorizedError();
    }

  })

export { router as refreshTokenRouter };