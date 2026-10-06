import { OrderRepository } from '../repositories/order-repository.js';
import { PaymentService } from './payment-service.js';
import { InventoryService } from './inventory-service.js';
import { Order } from '../models/order.js';
import { db } from '../database/database.js';
import { OrderCreatedEvent, OrderCompletedEvent, OrderFailedEvent } from '../events/order-events.js';
import { EventPublisher } from '../events/event-publisher.js';

export interface CreateOrderRequest {
  customer_name: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
  payment: {
    card_number: string;
    payment_type: 'credit' | 'debit';
  };
}

export class OrderService {
  private orderRepository = new OrderRepository();
  private paymentService = new PaymentService();
  private inventoryService = new InventoryService();
  private eventPublisher = new EventPublisher();

  async createOrder(request: CreateOrderRequest): Promise<{ orderId: number; status: string; message: string }> {
    // Validações básicas
    if (!request.customer_name || !request.items || !request.payment) {
      throw new Error('Dados inválidos');
    }

    if (request.items.length === 0) {
      throw new Error('Pedido deve conter pelo menos um item');
    }

    // Calcular total
    const total_amount = request.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (total_amount <= 0) {
      throw new Error('Valor total do pedido deve ser maior que zero');
    }

    console.log(`\n📦 Criando pedido para ${request.customer_name}...`);

    // 1. CRIAR PEDIDO (dentro de transação)
    const transaction = db.transaction(() => {
      const order: Order = {
        customer_name: request.customer_name,
        total_amount,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const orderId = this.orderRepository.create(order);
      return orderId;
    });

    const orderId = transaction();
    console.log(`✓ Pedido #${orderId} criado`);

    const createdEvent = new OrderCreatedEvent(orderId, request.customer_name, total_amount, request.items);
    await this.eventPublisher.publish(createdEvent);

    try {
      // 2. PROCESSAR PAGAMENTO (CHAMADA SÍNCRONA AO SERVICE - ACOPLAMENTO!)
      const paymentApproved = await this.paymentService.processPayment(
        orderId,
        request.payment.card_number,
        request.payment.payment_type,
        total_amount
      );

      if (!paymentApproved) {
        this.orderRepository.updateStatus(orderId, 'failed');

        const failedEvent = new OrderFailedEvent(orderId, 'payment_declined');
        await this.eventPublisher.publish(failedEvent);

        throw new Error('Pagamento recusado');
      }

      // 3. ATUALIZAR ESTOQUE (CHAMADA SÍNCRONA AO SERVICE - ACOPLAMENTO!)
      const inventoryItems = request.items.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity
      }));

      await this.inventoryService.reserveStock(inventoryItems);

      this.orderRepository.updateStatus(orderId, 'paid');
      console.log(`✓ Pedido #${orderId} finalizado com sucesso\n`);

      const completedEvent = new OrderCompletedEvent(orderId);
      await this.eventPublisher.publish(completedEvent);

      return {
        orderId,
        status: 'paid',
        message: 'Pedido criado com sucesso'
      };
    } catch (error) {
      // Se algo falhar após criar o pedido, garantir que o status seja atualizado
      this.orderRepository.updateStatus(orderId, 'failed');
      throw error;
    }
  }
}