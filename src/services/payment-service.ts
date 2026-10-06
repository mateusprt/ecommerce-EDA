import { PaymentRepository } from '../repositories/payment-repository.js';
import { Payment } from '../models/payment.js';
import { PaymentGateway } from '../gateways/payment-gateway.interface.js';
import { CreditGateway } from '../gateways/credit-gateway.js';
import { DebitGateway } from '../gateways/debit-gateway.js';
import { PaymentApprovedEvent, PaymentDeclinedEvent } from '../events/payment-events.js';
import { EventPublisher } from '../events/event-publisher.js';

export class PaymentService {
  private paymentRepository = new PaymentRepository();
  private eventPublisher = new EventPublisher();
  private creditGateway: PaymentGateway = new CreditGateway();
  private debitGateway: PaymentGateway = new DebitGateway();

  async processPayment(orderId: number, cardNumber: string, paymentType: 'credit' | 'debit', amount: number): Promise<boolean> {
    // Validações básicas
    if (!cardNumber || cardNumber.length < 13) {
      throw new Error('Número do cartão inválido');
    }

    if (amount <= 0) {
      throw new Error('Valor do pagamento deve ser maior que zero');
    }

    console.log(`💳 Processando pagamento ${paymentType}...`);

    // Selecionar gateway apropriado baseado no tipo de pagamento
    const gateway = paymentType === 'credit' ? this.creditGateway : this.debitGateway;

    // Processar pagamento através do gateway externo
    const gatewayResponse = await gateway.processPayment(cardNumber, amount);

    // Criar registro de pagamento
    const payment: Payment = {
      order_id: orderId,
      card_number: cardNumber,
      payment_type: paymentType,
      amount,
      status: gatewayResponse.approved ? 'approved' : 'declined',
      created_at: new Date().toISOString()
    };

    const paymentId = this.paymentRepository.create(payment);

    if (!gatewayResponse.approved) {
      console.log(`✗ Pagamento recusado: ${gatewayResponse.message}`);

      const declinedEvent = new PaymentDeclinedEvent(orderId, paymentType, amount, gatewayResponse.message);
      await this.eventPublisher.publish(declinedEvent);

      return false;
    }

    console.log(`✓ Pagamento aprovado: ${gatewayResponse.message}`);

    const approvedEvent = new PaymentApprovedEvent(orderId, paymentType, amount, gatewayResponse.message);
    await this.eventPublisher.publish(approvedEvent);

    return true;
  }
}