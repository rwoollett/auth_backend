import express, { NextFunction, Request, Response } from 'express';
const router = express.Router();

interface UserPayload {
  currentToken: string|null;
}

router.get(
  '/api/users/currenttoken',
  (req, res) => {
    if (req.session?.jwt) {
      res.send({ currentToken: req.session?.jwt } as UserPayload);
    } else {
      res.send({ currentToken: null } as UserPayload);
    }
  })

export { router as currentTokenRouter };