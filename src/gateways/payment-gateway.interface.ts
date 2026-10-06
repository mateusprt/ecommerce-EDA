export interface PaymentGatewayResponse {
  approved: boolean;
  transactionId: string;
  message: string;
}

export interface PaymentGateway {
  processPayment(cardNumber: string, amount: number): Promise<PaymentGatewayResponse>;
  getName(): string;
}
