import { BaseEvent } from './base-event.js';

interface OrderCreatedData {
  orderId: number;
  customerName: string;
  totalAmount: number;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

interface OrderCompletedData {
  orderId: number;
  status: 'paid';
}

interface OrderFailedData {
  orderId: number;
  status: 'failed';
  reason: string;
}

export class OrderCreatedEvent extends BaseEvent<OrderCreatedData> {
  readonly eventType = 'OrderCreated';

  constructor(
    orderId: number,
    customerName: string,
    totalAmount: number,
    items: Array<{
      product_name: string;
      quantity: number;
      price: number;
    }>
  ) {
    super({
      orderId,
      customerName,
      totalAmount,
      items
    });
  }
}

export class OrderCompletedEvent extends BaseEvent<OrderCompletedData> {
  readonly eventType = 'OrderCompleted';

  constructor(orderId: number) {
    super({
      orderId,
      status: 'paid'
    });
  }
}

export class OrderFailedEvent extends BaseEvent<OrderFailedData> {
  readonly eventType = 'OrderFailed';

  constructor(orderId: number, reason: string) {
    super({
      orderId,
      status: 'failed',
      reason
    });
  }
}
