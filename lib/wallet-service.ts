import apiFetch from './api';

export interface Wallet {
  id: string;
  created_at?: string;
  // add other fields returned by backend as needed
}

export interface WalletBalance {
  currency: string;
  amount: string;
}

export interface Transaction {
  id: string;
  type: string;
  wallet: string;
  from_currency?: string;
  to_currency?: string;
  from_amount?: string;
  to_amount?: string;
  rate?: string;
  created_at?: string;
}

export async function createWallet(): Promise<Wallet> {
  return createWallet();
}

import { createWallet, getWallet, getTransactions, deposit, swap } from '@/lib/wallet-service';
export async function getWallet(walletId: string): Promise<Wallet> {
  return apiFetch(`/api/wallets/${walletId}`, { method: 'GET' });
}

export async function deposit(walletId: string, payload: { currency?: string; amount: string; }): Promise<any> {
  return apiFetch(`/api/wallets/${walletId}/deposit`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function swap(walletId: string, payload: { from_currency: string; to_currency: string; from_amount: string; }): Promise<any> {
  return apiFetch(`/api/wallets/${walletId}/swap`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function getTransactions(walletId: string): Promise<Transaction[]> {
  return apiFetch(`/api/wallets/${walletId}/transactions`, { method: 'GET' });
}
