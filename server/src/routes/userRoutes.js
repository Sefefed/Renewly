import { Router } from 'express';
import { getUsers, getUser } from '../controllers/userController.js';
import authorize from '../middleware/authMiddleware.js';
const userRouter = Router();

userRouter.get('/', getUsers);

userRouter.get('/:id', authorize, getUser);

userRouter.post('/:id', (req, res) => {
  res.send(`User ${req.params.id} profile update endpoint`);
})

userRouter.put('/:id', (req, res) => {
  res.send({
    message: `User ${req.params.id} profile updated successfully`
  });
})

export default userRouter;