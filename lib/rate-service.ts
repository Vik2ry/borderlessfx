import { ApiService } from "./api-service"
import { EXCHANGE_RATES } from "./demo-data"

export interface RateData {
  [key: string]: number
}

export class RateService {
  private static rates: RateData = { ...EXCHANGE_RATES }
  private static lastUpdated: Date = new Date()
  private static updateInterval: NodeJS.Timeout | null = null
  private static listeners: Array<(rates: RateData) => void> = []

  // Start periodic rate updates (every 2-5 minutes as per documentation)
  static startRateUpdates(): void {
    if (this.updateInterval) return

    console.log("[v0] Starting periodic rate updates")
    this.updateRates() // Initial fetch

    // Update every 3 minutes (180000ms)
    this.updateInterval = setInterval(() => {
      this.updateRates()
    }, 180000)
  }

  static stopRateUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
      console.log("[v0] Stopped periodic rate updates")
    }
  }

  private static async updateRates(): Promise<void> {
    try {
      console.log("[v0] Updating exchange rates...")
      const ratesResponse = await ApiService.getExchangeRates()

      if (ratesResponse && ratesResponse.rates) {
        // Convert API response to our rate format
        const newRates: RateData = { ...EXCHANGE_RATES }

        ratesResponse.rates.forEach((rate) => {
          // Assuming API returns rates relative to USD
          if (rate.to === "USD" || rate.to === "USDx") {
            newRates[rate.from] = rate.rate
          }
        })

        this.rates = newRates
        this.lastUpdated = new Date()
        console.log("[v0] Successfully updated exchange rates:", newRates)

        // Notify all listeners
        this.listeners.forEach((listener) => listener(newRates))
      } else {
        console.log("[v0] Failed to fetch rates, using cached rates")
      }
    } catch (error) {
      console.error("[v0] Error updating rates:", error)
    }
  }

  static getCurrentRates(): RateData {
    return { ...this.rates }
  }

  static getLastUpdated(): Date {
    return this.lastUpdated
  }

  static addRateListener(listener: (rates: RateData) => void): void {
    this.listeners.push(listener)
  }

  static removeRateListener(listener: (rates: RateData) => void): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // Get rate for currency pair
  static getRate(fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return 1

    const fromRate = this.rates[fromCurrency] || 1
    const toRate = this.rates[toCurrency] || 1

    return fromRate / toRate
  }

  // Convert amount between currencies
  static convertAmount(amount: number, fromCurrency: string, toCurrency: string): number {
    const rate = this.getRate(fromCurrency, toCurrency)
    return amount * rate
  }
}
