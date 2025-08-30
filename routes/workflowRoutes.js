import { Router } from 'express';
import { sendReminder } from '../controllers/workflowController.js';
const workflowRouter = Router();

workflowRouter.post('/subscription/reminder', sendReminder);

export default workflowRouter;