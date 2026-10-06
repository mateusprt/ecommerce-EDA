export interface Order {
  id?: number;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

export interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}