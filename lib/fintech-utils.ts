export interface TransactionLimit {
  daily: number
  monthly: number
  perTransaction: number
}

export interface ComplianceData {
  ip: string
  userAgent: string
  country: string
  timestamp: string
  action: string
  userId?: string
}

// Transaction limits by currency (in USD equivalent)
export const TRANSACTION_LIMITS: Record<string, TransactionLimit> = {
  default: {
    daily: 10000, // $10,000 daily limit
    monthly: 50000, // $50,000 monthly limit
    perTransaction: 5000, // $5,000 per transaction
  },
  verified: {
    daily: 50000, // $50,000 daily limit for verified users
    monthly: 200000, // $200,000 monthly limit
    perTransaction: 25000, // $25,000 per transaction
  },
}

export class FintechValidator {
  // Validate transaction amount against limits
  static validateTransactionAmount(
    amount: number,
    currency: string,
    exchangeRate: number,
    userTier: "default" | "verified" = "default",
  ): { valid: boolean; error?: string } {
    const usdAmount = amount * exchangeRate
    const limits = TRANSACTION_LIMITS[userTier]

    if (usdAmount > limits.perTransaction) {
      return {
        valid: false,
        error: `Transaction amount exceeds limit of $${limits.perTransaction.toLocaleString()}`,
      }
    }

    return { valid: true }
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate phone number (international format)
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(phone)
  }

  // Validate username/handle
  static validateHandle(handle: string): { valid: boolean; error?: string } {
    if (handle.length < 3) {
      return { valid: false, error: "Username must be at least 3 characters long" }
    }
    if (handle.length > 20) {
      return { valid: false, error: "Username must be less than 20 characters long" }
    }
    if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
      return { valid: false, error: "Username can only contain letters, numbers, and underscores" }
    }
    return { valid: true }
  }

  // Generate secure transaction ID
  static generateTransactionId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 9)
    return `tx_${timestamp}_${random}`
  }

  // Check for suspicious activity patterns
  static detectSuspiciousActivity(
    transactions: any[],
    timeWindow = 3600000, // 1 hour in milliseconds
  ): boolean {
    const now = Date.now()
    const recentTransactions = transactions.filter((tx) => now - new Date(tx.timestamp).getTime() < timeWindow)

    // Flag if more than 10 transactions in 1 hour
    if (recentTransactions.length > 10) return true

    // Flag if total amount exceeds $50,000 in 1 hour
    const totalAmount = recentTransactions.reduce((sum, tx) => sum + tx.usd_equivalent, 0)
    if (totalAmount > 50000) return true

    return false
  }
}

export class ComplianceLogger {
  private static getStorageKey(): string {
    return "compliance_audit_log"
  }

  // Log compliance data for audit trail
  static logActivity(data: Omit<ComplianceData, "timestamp">): void {
    const fullData: ComplianceData = {
      ...data,
      timestamp: new Date().toISOString(),
    }

    const existingLogs = this.getAuditLog()
    existingLogs.push(fullData)

    // Keep only last 1000 entries to prevent storage bloat
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000)
    }

    localStorage.setItem(this.getStorageKey(), JSON.stringify(existingLogs))
  }

  // Get audit log entries
  static getAuditLog(): ComplianceData[] {
    const stored = localStorage.getItem(this.getStorageKey())
    return stored ? JSON.parse(stored) : []
  }

  // Get user's country from IP (mock implementation)
  static async getUserCountry(): Promise<string> {
    try {
      // In production, this would use a real IP geolocation service
      return "NG" // Default to Nigeria for demo
    } catch {
      return "UNKNOWN"
    }
  }

  // Get browser/device info
  static getDeviceInfo(): { userAgent: string; ip: string } {
    return {
      userAgent: navigator.userAgent,
      ip: "127.0.0.1", // In production, this would be the real IP
    }
  }
}

// Currency formatting utilities
export class CurrencyFormatter {
  static format(amount: number, currency: string): string {
    const formatters: Record<string, Intl.NumberFormat> = {
      cNGN: new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }),
      cXAF: new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF" }),
      USDx: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
      EURx: new Intl.NumberFormat("en-EU", { style: "currency", currency: "EUR" }),
    }

    const formatter = formatters[currency]
    if (formatter) {
      return formatter.format(amount).replace(/NGN|XAF|USD|EUR/, currency)
    }

    return `${amount.toLocaleString()} ${currency}`
  }

  static formatCompact(amount: number, currency: string): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ${currency}`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K ${currency}`
    }
    return `${amount.toLocaleString()} ${currency}`
  }
}
