import { Router } from 'express';

const authRouter = Router();

authRouter.post('/signup', (req, res) => {
  res.send('User signup endpoint');
});

authRouter.post('/signin', (req, res) => {
  res.send('User signin endpoint');
});

authRouter.post('/signout', (req, res) => {
  res.send('User signout endpoint');
});

export default authRouter;