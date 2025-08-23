import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { UserTable as User } from '../models';
import { Password } from '../services/password';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';

const router = express.Router();

router.post('/api/users/signin',
  [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    // Generate Access JWT
    const payload = {
      id: existingUser.id,
      email: existingUser.email
    }; 
    const userJwt = jwt.sign(
      payload,
      process.env.JWT_KEY!,
      { expiresIn: '2m' }
    );

    // Generate Refresh JWT
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_KEY!,
      { expiresIn: '7d' } // Valid for 7 days
    );

    // Store on session object (cookie)
    req.session = {
      jwt: userJwt,
      refresh: refreshToken
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };