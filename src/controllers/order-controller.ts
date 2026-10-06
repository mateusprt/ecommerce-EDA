import { Request, Response } from 'express';
import { OrderService } from '../services/order-service.js';

export class OrderController {
  private orderService = new OrderService();

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const result = this.orderService.createOrder(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error(`\n❌ Erro: ${(error as Error).message}\n`);
      res.status(400).json({
        error: (error as Error).message
      });
    }
  }
}