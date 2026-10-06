import { PaymentGateway, PaymentGatewayResponse } from './payment-gateway.interface.js';

export class DebitGateway implements PaymentGateway {
  getName(): string {
    return 'DebitGateway';
  }

  async processPayment(cardNumber: string, amount: number): Promise<PaymentGatewayResponse> {
    console.log(`[DebitGateway] Processando pagamento de débito: R$ ${amount}`);

    // Simular latência de rede
    await this.simulateNetworkDelay();

    // Lógica fake: cartões terminados em 0, 2, 4, 6, 8 são aprovados
    const lastDigit = parseInt(cardNumber.slice(-1));
    const isApproved = lastDigit % 2 === 0;

    const transactionId = `DEBIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (isApproved) {
      console.log(`[DebitGateway] Pagamento aprovado - Transaction ID: ${transactionId}`);
      return {
        approved: true,
        transactionId,
        message: 'Pagamento aprovado pelo gateway de débito'
      };
    } else {
      console.log(`[DebitGateway] Pagamento recusado - Saldo insuficiente`);
      return {
        approved: false,
        transactionId,
        message: 'Pagamento recusado - saldo insuficiente'
      };
    }
  }

  private async simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 200 + 100; // 100-300ms (débito é mais rápido)
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
