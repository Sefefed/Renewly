import { Router } from 'express';
import authorize from '../middleware/authMiddleware.js';
import { createSubscription, getUserSubscriptions } from '../controllers/subscriptionController.js';
const subscriptionRouter = Router();

subscriptionRouter.post('/', authorize, createSubscription);
subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

export default subscriptionRouter;