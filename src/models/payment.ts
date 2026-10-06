export interface Payment {
  id?: number;
  order_id: number;
  card_number: string;
  payment_type: 'credit' | 'debit';
  amount: number;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
}