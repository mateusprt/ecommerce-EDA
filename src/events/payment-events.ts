import { BaseEvent } from './base-event.js';

interface PaymentApprovedData {
  orderId: number;
  paymentType: 'credit' | 'debit';
  amount: number;
  message: string;
}

interface PaymentDeclinedData {
  orderId: number;
  paymentType: 'credit' | 'debit';
  amount: number;
  reason: string;
}

export class PaymentApprovedEvent extends BaseEvent<PaymentApprovedData> {
  readonly eventType = 'PaymentApproved';

  constructor(orderId: number, paymentType: 'credit' | 'debit', amount: number, message: string) {
    super({
      orderId,
      paymentType,
      amount,
      message
    });
  }
}

export class PaymentDeclinedEvent extends BaseEvent<PaymentDeclinedData> {
  readonly eventType = 'PaymentDeclined';

  constructor(orderId: number, paymentType: 'credit' | 'debit', amount: number, reason: string) {
    super({
      orderId,
      paymentType,
      amount,
      reason
    });
  }
}
