import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { NotFoundError, errorHandler } from '@rwtix/common';
import { indexRouter } from './routes';
import { homeRouter } from './routes/home';

const envWhitelist = process.env.WHITELIST_CORS ? (process.env.WHITELIST_CORS as string).split(',') : [];
const whitelist = [
  'http://localhost:3000'
].concat(envWhitelist);
console.log('Whitelist',whitelist);
const app = express();

app.set('trust proxy', true);

app.use(json());
//const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
app.use(cors({
  origin: function (origin: string | undefined, callback) {
    console.log('Origin', origin);
    // allow requests with no origin 
    if (!origin) return callback(null, true);
    if (whitelist.indexOf(origin) === -1) {
      const message = `The CORS policy for this origin doesn't ` +
        `allow access from the particular origin: ${origin}.`;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use((
  _,
  res: Response,
  next: NextFunction
) => {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(
  cookieSession({
    signed: false,
    secure: false,//(process.env.NODE_ENV === 'production'),
    httpOnly: true,
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(indexRouter);
app.use(homeRouter);

app.all('*', async (req: Request, res: Response) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
