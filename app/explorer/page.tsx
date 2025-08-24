"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Globe, RefreshCw, Plus, Send, TrendingUp } from "lucide-react"
import Link from "next/link"
import { ApiService, type ExplorerTransaction } from "@/lib/api-service"

export default function ExplorerPage() {
  const [transactions, setTransactions] = useState<ExplorerTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchRecentTransactions = async () => {
    setIsLoading(true)
    try {
      const recentTransactions = await ApiService.getRecentTransactions()
      setTransactions(recentTransactions)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("[v0] Error fetching recent transactions:", error)
      // Fallback to demo data if API fails
      const demoTransactions: ExplorerTransaction[] = [
        {
          id: "tx_demo_1",
          type: "transfer",
          from_currency: "USDx",
          to_currency: "cNGN",
          amount: 100,
          rate: 1650,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          status: "completed",
        },
        {
          id: "tx_demo_2",
          type: "swap",
          from_currency: "EURx",
          to_currency: "USDx",
          amount: 50,
          rate: 1.08,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          status: "completed",
        },
        {
          id: "tx_demo_3",
          type: "deposit",
          to_currency: "cXAF",
          amount: 25000,
          timestamp: new Date(Date.now() - 900000).toISOString(),
          status: "completed",
        },
      ]
      setTransactions(demoTransactions)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentTransactions()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRecentTransactions, 30000)
    return () => clearInterval(interval)
  }, [])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <Plus className="w-4 h-4 text-green-600" />
      case "swap":
        return <RefreshCw className="w-4 h-4 text-blue-600" />
      case "transfer":
        return <Send className="w-4 h-4 text-purple-600" />
      default:
        return <TrendingUp className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionTitle = (transaction: ExplorerTransaction) => {
    switch (transaction.type) {
      case "deposit":
        return `Deposit ${transaction.amount.toLocaleString()} ${transaction.to_currency}`
      case "swap":
        return `Swap ${transaction.from_currency} → ${transaction.to_currency}`
      case "transfer":
        return `Transfer ${transaction.amount.toLocaleString()} ${transaction.to_currency}`
      default:
        return "Transaction"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/wallet"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-serif">Back to Wallet</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-sans text-foreground">Borderless</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-sans text-foreground">Transaction Explorer</h1>
              <p className="text-muted-foreground font-serif">Real-time feed of recent network activity</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground font-serif">Last Updated</p>
                <p className="text-sm font-sans text-foreground">{lastUpdated.toLocaleTimeString()}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRecentTransactions}
                disabled={isLoading}
                className="font-sans bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-sans">Recent Network Activity</CardTitle>
            <CardDescription className="font-serif">
              Live feed of deposits, swaps, and transfers across the network
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                    <div className="h-4 bg-muted rounded w-20" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-serif">No recent transactions found</div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center space-x-4 p-4 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow"
                  >
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold font-sans text-sm text-foreground">
                          {getTransactionTitle(transaction)}
                        </h4>
                        <Badge
                          variant={transaction.status === "completed" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      {transaction.rate && (
                        <p className="text-sm text-muted-foreground font-serif">
                          Rate: {transaction.rate.toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground font-serif">
                        {new Date(transaction.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-muted-foreground">{transaction.id.slice(-8)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
