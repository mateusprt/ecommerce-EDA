import { Router } from 'express';
import { OrderController } from '../controllers/order-controller.js';

const router = Router();
const orderController = new OrderController();

router.post('/', (req, res) => orderController.createOrder(req, res));

export { router as orderRoutes };