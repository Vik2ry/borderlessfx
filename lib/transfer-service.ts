import apiFetch from './api';

export interface TransferPayload {
  from_wallet_id?: string;
  to_wallet_id?: string;
  to_handle?: string;
  currency: string;
  amount: string;
  idempotency_key?: string;
}

import { createTransfer } from '@/lib/transfer-service';
export async function createTransfer(payload: TransferPayload) {
  return createTransfer(\2);
}
