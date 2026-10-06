import { PaymentGateway, PaymentGatewayResponse } from './payment-gateway.interface.js';

export class CreditGateway implements PaymentGateway {
  getName(): string {
    return 'CreditGateway';
  }

  async processPayment(cardNumber: string, amount: number): Promise<PaymentGatewayResponse> {
    console.log(`[CreditGateway] Processando pagamento de crédito: R$ ${amount}`);

    // Simular latência de rede
    await this.simulateNetworkDelay();

    // Lógica fake: cartões terminados em número par são aprovados
    const lastDigit = parseInt(cardNumber.slice(-1));
    const isApproved = lastDigit % 2 === 0;

    const transactionId = `CREDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (isApproved) {
      console.log(`[CreditGateway] Pagamento aprovado - Transaction ID: ${transactionId}`);
      return {
        approved: true,
        transactionId,
        message: 'Pagamento aprovado pelo gateway de crédito'
      };
    } else {
      console.log(`[CreditGateway] Pagamento recusado - Cartão não autorizado`);
      return {
        approved: false,
        transactionId,
        message: 'Pagamento recusado - cartão não autorizado'
      };
    }
  }

  private async simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 300 + 200; // 200-500ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
