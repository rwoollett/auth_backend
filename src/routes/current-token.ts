import { NotAuthorizedError } from '@rwtix/common';
import express, { NextFunction, Request, Response } from 'express';
const router = express.Router();

// declare global {
//   namespace Express {
//     interface Request {
//       session?: { jwt?: string };
//     }
//   }
// }

// const currentToken = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (!req.session?.jwt) {
//     return next();
//   } else {
//     throw new NotAuthorizedError();
//   }
// };

router.get(
  '/api/users/currenttoken',
  (req, res) => {
    if (req.session?.jwt) {
      res.send({ currentToken: req.session?.jwt });
    } else {
      res.send({ currentToken: null });
    }
  })

export { router as currentTokenRouter };