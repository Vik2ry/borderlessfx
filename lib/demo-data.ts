export interface Balance {
  currency: string
  amount: number
  usd_equivalent: number
}

export interface WalletData {
  wallet_id: string
  email?: string
  phone?: string
  balances: Balance[]
  total_usd: number
}

export interface Transaction {
  id: string
  type: "deposit" | "swap" | "send" | "receive"
  from_currency?: string
  to_currency: string
  amount: number
  usd_equivalent: number
  recipient?: string
  sender?: string
  timestamp: string
  status: "completed" | "pending" | "failed"
}

// Mock exchange rates (in production, these would come from a real API)
export const EXCHANGE_RATES = {
  cNGN: 0.0012, // 1 cNGN = 0.0012 USD
  cXAF: 0.0016, // 1 cXAF = 0.0016 USD
  USDx: 1.0, // 1 USDx = 1.0 USD
  EURx: 1.08, // 1 EURx = 1.08 USD
}

export const SUPPORTED_CURRENCIES = ["cNGN", "cXAF", "USDx", "EURx"]

export class DemoWalletService {
  private static getStorageKey(walletId: string, key: string): string {
    return `demo_${walletId}_${key}`
  }

  static initializeDemoWallet(walletId: string, email?: string, phone?: string): WalletData {
    const initialBalances: Balance[] = [
      { currency: "cNGN", amount: 50000, usd_equivalent: 50000 * EXCHANGE_RATES.cNGN },
      { currency: "USDx", amount: 100, usd_equivalent: 100 * EXCHANGE_RATES.USDx },
      { currency: "EURx", amount: 50, usd_equivalent: 50 * EXCHANGE_RATES.EURx },
      { currency: "cXAF", amount: 25000, usd_equivalent: 25000 * EXCHANGE_RATES.cXAF },
    ]

    const walletData: WalletData = {
      wallet_id: walletId,
      email,
      phone,
      balances: initialBalances,
      total_usd: initialBalances.reduce((sum, balance) => sum + balance.usd_equivalent, 0),
    }

    localStorage.setItem(this.getStorageKey(walletId, "data"), JSON.stringify(walletData))
    return walletData
  }

  static getWalletData(walletId: string): WalletData | null {
    const stored = localStorage.getItem(this.getStorageKey(walletId, "data"))
    return stored ? JSON.parse(stored) : null
  }

  static updateWalletData(walletData: WalletData): void {
    // Recalculate total USD
    walletData.total_usd = walletData.balances.reduce((sum, balance) => sum + balance.usd_equivalent, 0)
    localStorage.setItem(this.getStorageKey(walletData.wallet_id, "data"), JSON.stringify(walletData))
  }

  static addTransaction(walletId: string, transaction: Omit<Transaction, "id" | "timestamp">): Transaction {
    const fullTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }

    const transactions = this.getTransactions(walletId)
    transactions.unshift(fullTransaction)
    localStorage.setItem(this.getStorageKey(walletId, "transactions"), JSON.stringify(transactions))

    return fullTransaction
  }

  static getTransactions(walletId: string): Transaction[] {
    const stored = localStorage.getItem(this.getStorageKey(walletId, "transactions"))
    return stored ? JSON.parse(stored) : []
  }

  static deposit(walletId: string, currency: string, amount: number): boolean {
    const walletData = this.getWalletData(walletId)
    if (!walletData) return false

    const balanceIndex = walletData.balances.findIndex((b) => b.currency === currency)
    const usdEquivalent = amount * EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES]

    if (balanceIndex >= 0) {
      walletData.balances[balanceIndex].amount += amount
      walletData.balances[balanceIndex].usd_equivalent += usdEquivalent
    } else {
      walletData.balances.push({
        currency,
        amount,
        usd_equivalent: usdEquivalent,
      })
    }

    this.updateWalletData(walletData)
    this.addTransaction(walletId, {
      type: "deposit",
      to_currency: currency,
      amount,
      usd_equivalent: usdEquivalent,
      status: "completed",
    })

    return true
  }

  static swap(walletId: string, fromCurrency: string, toCurrency: string, fromAmount: number): boolean {
    const walletData = this.getWalletData(walletId)
    if (!walletData) return false

    const fromBalance = walletData.balances.find((b) => b.currency === fromCurrency)
    if (!fromBalance || fromBalance.amount < fromAmount) return false

    const fromRate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES]
    const toRate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES]
    const toAmount = (fromAmount * fromRate) / toRate

    // Deduct from source currency
    fromBalance.amount -= fromAmount
    fromBalance.usd_equivalent = fromBalance.amount * fromRate

    // Add to target currency
    const toBalanceIndex = walletData.balances.findIndex((b) => b.currency === toCurrency)
    if (toBalanceIndex >= 0) {
      walletData.balances[toBalanceIndex].amount += toAmount
      walletData.balances[toBalanceIndex].usd_equivalent += toAmount * toRate
    } else {
      walletData.balances.push({
        currency: toCurrency,
        amount: toAmount,
        usd_equivalent: toAmount * toRate,
      })
    }

    this.updateWalletData(walletData)
    this.addTransaction(walletId, {
      type: "swap",
      from_currency: fromCurrency,
      to_currency: toCurrency,
      amount: fromAmount,
      usd_equivalent: fromAmount * fromRate,
      status: "completed",
    })

    return true
  }

  static send(walletId: string, currency: string, amount: number, recipient: string): boolean {
    const walletData = this.getWalletData(walletId)
    if (!walletData) return false

    const balance = walletData.balances.find((b) => b.currency === currency)
    if (!balance || balance.amount < amount) return false

    const rate = EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES]
    const usdEquivalent = amount * rate

    balance.amount -= amount
    balance.usd_equivalent = balance.amount * rate

    this.updateWalletData(walletData)
    this.addTransaction(walletId, {
      type: "send",
      to_currency: currency,
      amount,
      usd_equivalent: usdEquivalent,
      recipient,
      status: "completed",
    })

    return true
  }

  static processTransfer(
    walletId: string,
    fromCurrency: string,
    amount: number,
    recipient: string,
    targetCurrency: string,
  ): boolean {
    const walletData = this.getWalletData(walletId)
    if (!walletData) return false

    const balance = walletData.balances.find((b) => b.currency === fromCurrency)
    if (!balance || balance.amount < amount) return false

    const fromRate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES]
    const targetRate = EXCHANGE_RATES[targetCurrency as keyof typeof EXCHANGE_RATES]
    const usdEquivalent = amount * fromRate
    const convertedAmount = (amount * fromRate) / targetRate

    // Deduct from sender's balance
    balance.amount -= amount
    balance.usd_equivalent = balance.amount * fromRate

    this.updateWalletData(walletData)

    // Add transaction record
    this.addTransaction(walletId, {
      type: "send",
      from_currency: fromCurrency !== targetCurrency ? fromCurrency : undefined,
      to_currency: targetCurrency,
      amount: fromCurrency !== targetCurrency ? convertedAmount : amount,
      usd_equivalent: usdEquivalent,
      recipient,
      status: "completed",
    })

    return true
  }
}
