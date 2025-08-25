export interface ExchangeRate {
  from: string
  to: string
  rate: number
  timestamp: string
}

export interface ExchangeRatesResponse {
  rates: ExchangeRate[]
  timestamp: string
}

export interface PreviewResponse {
  credited_amount: number
  rate?: number
  fees?: number
  total_cost: number
}

export interface ExplorerTransaction {
  id: string
  type: "deposit" | "swap" | "transfer"
  from_currency?: string
  to_currency: string
  amount: number
  rate?: number
  timestamp: string
  status: string
}

const BASE_URL = "https://unbordered-production.up.railway.app/api"

export class ApiService {
  private static generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Exchange Rates API
  static async getExchangeRates(): Promise<ExchangeRatesResponse | null> {
    try {
      console.log("[v0] Fetching exchange rates from API")
      const response = await fetch(`${BASE_URL}/rates`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Successfully fetched exchange rates:", data)
        return data
      } else {
        console.log("[v0] Failed to fetch exchange rates, status:", response.status)
        return null
      }
    } catch (error) {
      console.error("[v0] Error fetching exchange rates:", error)
      return null
    }
  }

  // Swap Preview API
  static async getSwapPreview(
    walletId: string,
    fromCurrency: string,
    toCurrency: string,
    amount: number,
  ): Promise<PreviewResponse | null> {
    try {
      console.log("[v0] Getting swap preview from API")
      const response = await fetch(`${BASE_URL}/wallets/${walletId}/swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_id: walletId,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          amount,
          preview: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Successfully got swap preview:", data)
        return data
      } else {
        console.log("[v0] Failed to get swap preview, status:", response.status)
        return null
      }
    } catch (error) {
      console.error("[v0] Error getting swap preview:", error)
      return null
    }
  }

  // Execute Swap API
  static async executeSwap(walletId: string, fromCurrency: string, toCurrency: string, amount: number): Promise<any> {
    try {
      console.log("[v0] Executing swap via API")
      const response = await fetch(`${BASE_URL}/wallets/${walletId}/swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": this.generateIdempotencyKey(),
        },
        body: JSON.stringify({
          wallet_id: walletId,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          amount,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Successfully executed swap:", data)
        return data
      } else {
        throw new Error(`Swap failed: ${response.status}`)
      }
    } catch (error) {
      console.error("[v0] Error executing swap:", error)
      throw error
    }
  }

  // Transfer Preview API
  static async getTransferPreview(
    fromWalletId: string,
    toWalletId: string,
    currency: string,
    amount: number,
    targetCurrency?: string,
  ): Promise<PreviewResponse | null> {
    try {
      console.log("[v0] Getting transfer preview from API")
      const response = await fetch(`${BASE_URL}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from_wallet_id: fromWalletId,
          to_wallet_id: toWalletId,
          currency,
          amount,
          target_currency: targetCurrency,
          preview: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Successfully got transfer preview:", data)
        return data
      } else {
        console.log("[v0] Failed to get transfer preview, status:", response.status)
        return null
      }
    } catch (error) {
      console.error("[v0] Error getting transfer preview:", error)
      return null
    }
  }

  // Execute Transfer API
  static async executeTransfer(
    fromWalletId: string,
    toWalletId: string,
    currency: string,
    amount: number,
    targetCurrency?: string,
  ): Promise<any> {
    try {
      console.log("[v0] Executing transfer via API")
      const response = await fetch(`${BASE_URL}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": this.generateIdempotencyKey(),
        },
        body: JSON.stringify({
          from_wallet_id: fromWalletId,
          to_wallet_id: toWalletId,
          currency,
          amount,
          target_currency: targetCurrency,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Successfully executed transfer:", data)
        return data
      } else {
        throw new Error(`Transfer failed: ${response.status}`)
      }
    } catch (error) {
      console.error("[v0] Error executing transfer:", error)
      throw error
    }
  }

  // Explorer API
  static async getRecentTransactions(): Promise<ExplorerTransaction[]> {
    try {
      console.log("[v0] Fetching recent transactions from explorer API")
      const response = await fetch(`${BASE_URL}/explorer/recent`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Successfully fetched recent transactions:", data)
        return data.transactions || []
      } else {
        console.log("[v0] Failed to fetch recent transactions, status:", response.status)
        return []
      }
    } catch (error) {
      console.error("[v0] Error fetching recent transactions:", error)
      return []
    }
  }
}
