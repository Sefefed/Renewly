import { Router } from 'express';

const subscriptionRouter = Router();

subscriptionRouter.get('/', (req, res) => res.send('Subscription endpoint'));

subscriptionRouter.get('/:id', (req, res) => {
  res.send(`Subscription ${req.params.id} endpoint`);
});

subscriptionRouter.post('/:id', (req, res) => {
  res.send(`Subscription ${req.params.id} update endpoint`);
});

subscriptionRouter.put('/:id', (req, res) => {
  res.send({
    message: `Subscription ${req.params.id} updated successfully`
  });
});

export default subscriptionRouter;