export interface PaymentMutation {
  id: string;
  username: string;
  method: 'WEBSITE' | 'WHATSAPP';
  date: string;
  amount: number;
  robuxNominal: string;
  robuxCount: number;
  status: 'LUNAS';
}

export const INITIAL_PAYMENT_MUTATIONS: PaymentMutation[] = [];

export function getStoredPayments(): PaymentMutation[] {
  return [];
}

