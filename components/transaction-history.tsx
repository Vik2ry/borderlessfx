"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Plus } from "lucide-react"
import { DemoWalletService } from "@/lib/demo-data"

interface Transaction {
  id: string
  type: "deposit" | "swap" | "transfer_sent" | "transfer_received"
  amount: number
  currency: string
  counterparty?: string
  rate?: number
  timestamp: string
  status: string
}

interface TransactionHistoryProps {
  walletId: string
  limit?: number
  isDemoMode?: boolean
}

export function TransactionHistory({ walletId, limit, isDemoMode }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (isDemoMode || localStorage.getItem("demo_mode") === "true") {
          console.log("[v0] Using demo mode for transactions")
          const demoTransactions = DemoWalletService.getTransactions(walletId)
          console.log("[v0] Demo transactions found:", demoTransactions.length)

          // Convert demo transaction format to component format
          const convertedTransactions = demoTransactions.map((tx) => ({
            id: tx.id,
            type:
              tx.type === "send"
                ? "transfer_sent"
                : tx.type === "receive"
                  ? "transfer_received"
                  : (tx.type as "deposit" | "swap"),
            amount: tx.amount,
            currency: tx.to_currency,
            counterparty: tx.recipient || tx.sender,
            timestamp: tx.timestamp,
            status: tx.status,
          }))

          const limitedTransactions = limit ? convertedTransactions.slice(0, limit) : convertedTransactions
          setTransactions(limitedTransactions)
          setIsLoading(false)
          return
        }

        console.log("[v0] Fetching transactions from API")
        const url = `https://unbordered-production.up.railway.app/api/wallets/${walletId}/transactions${limit ? `?limit=${limit}` : ""}`
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setTransactions(data.transactions || [])
        } else {
          console.log("[v0] API failed, switching to demo mode for transactions")
          localStorage.setItem("demo_mode", "true")
          const demoTransactions = DemoWalletService.getTransactions(walletId)
          const convertedTransactions = demoTransactions.map((tx) => ({
            id: tx.id,
            type:
              tx.type === "send"
                ? "transfer_sent"
                : tx.type === "receive"
                  ? "transfer_received"
                  : (tx.type as "deposit" | "swap"),
            amount: tx.amount,
            currency: tx.to_currency,
            counterparty: tx.recipient || tx.sender,
            timestamp: tx.timestamp,
            status: tx.status,
          }))
          const limitedTransactions = limit ? convertedTransactions.slice(0, limit) : convertedTransactions
          setTransactions(limitedTransactions)
        }
      } catch (error) {
        console.error("[v0] Error fetching transactions:", error)
        console.log("[v0] Network error, using demo transactions")
        localStorage.setItem("demo_mode", "true")
        const demoTransactions = DemoWalletService.getTransactions(walletId)
        const convertedTransactions = demoTransactions.map((tx) => ({
          id: tx.id,
          type:
            tx.type === "send"
              ? "transfer_sent"
              : tx.type === "receive"
                ? "transfer_received"
                : (tx.type as "deposit" | "swap"),
          amount: tx.amount,
          currency: tx.to_currency,
          counterparty: tx.recipient || tx.sender,
          timestamp: tx.timestamp,
          status: tx.status,
        }))
        const limitedTransactions = limit ? convertedTransactions.slice(0, limit) : convertedTransactions
        setTransactions(limitedTransactions)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [walletId, limit, isDemoMode])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <Plus className="w-4 h-4 text-green-600" />
      case "swap":
        return <RefreshCw className="w-4 h-4 text-blue-600" />
      case "transfer_sent":
        return <ArrowUpRight className="w-4 h-4 text-red-600" />
      case "transfer_received":
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />
      default:
        return <div className="w-4 h-4" />
    }
  }

  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case "deposit":
        return "Deposit"
      case "swap":
        return "Currency Swap"
      case "transfer_sent":
        return "Money Sent"
      case "transfer_received":
        return "Money Received"
      default:
        return "Transaction"
    }
  }

  const getTransactionDescription = (transaction: Transaction) => {
    switch (transaction.type) {
      case "deposit":
        return `Added ${transaction.amount.toLocaleString()} ${transaction.currency}`
      case "swap":
        return `Exchanged currencies at rate ${transaction.rate}`
      case "transfer_sent":
        return `Sent to ${transaction.counterparty || "Unknown"}`
      case "transfer_received":
        return `Received from ${transaction.counterparty || "Unknown"}`
      default:
        return "Transaction completed"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 bg-card rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
            <div className="h-4 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground font-serif">
        No transactions yet. Start by making a deposit or transfer.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow"
        >
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            {getTransactionIcon(transaction.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold font-sans text-sm text-foreground">{getTransactionTitle(transaction)}</h4>
              <Badge variant={transaction.status === "completed" ? "default" : "secondary"} className="text-xs">
                {transaction.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-serif truncate">
              {getTransactionDescription(transaction)}
            </p>
            <p className="text-xs text-muted-foreground font-serif">
              {new Date(transaction.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold font-sans text-sm text-foreground">
              {transaction.type === "transfer_sent" ? "-" : "+"}
              {transaction.amount.toLocaleString()} {transaction.currency}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
