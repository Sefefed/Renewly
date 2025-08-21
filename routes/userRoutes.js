import { Router } from 'express';

const userRouter = Router();

userRouter.get('/', (req, res) => {
  res.send('User profile endpoint');
});

userRouter.get('/:id', (req, res) => {
  res.send(`User ${req.params.id} profile endpoint`);
})

userRouter.post('/:id', (req, res) => {
  res.send(`User ${req.params.id} profile update endpoint`);
})

userRouter.put('/:id', (req, res) => {
  res.send({
    message: `User ${req.params.id} profile updated successfully`
  });
})

export default userRouter;