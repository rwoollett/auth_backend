import express, { Request, Response } from 'express';
import { UserTable as User } from '../models';

const router = express.Router();

router.get('/api/users', async (req: Request, res: Response) => {
  const userList = await User.find();
  res.send(userList);
});

export { router as indexRouter };
