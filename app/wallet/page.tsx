"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, RefreshCw, Plus, TrendingUp, Globe, Menu } from "lucide-react"
import Link from "next/link"
import { DepositModal } from "@/components/deposit-modal"
import { SwapModal } from "@/components/swap-modal"
import { SendModal } from "@/components/send-modal"
import { TransactionHistory } from "@/components/transaction-history"
import { BalanceChart } from "@/components/balance-chart"
import { DemoWalletService, type WalletData } from "@/lib/demo-data"
import { RateService } from "@/lib/rate-service"

interface Balance {
  currency: string
  amount: number
  usd_equivalent: number
}

export default function WalletPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)

  useEffect(() => {
    const fetchWalletData = async () => {
      const walletId = localStorage.getItem("wallet_id")
      const demoMode = localStorage.getItem("demo_mode") === "true"

      if (!walletId) {
        window.location.href = "/onboard"
        return
      }

      setIsDemoMode(demoMode)

      try {
        if (demoMode) {
          console.log("[v0] Using demo mode for wallet:", walletId)
          let demoData = DemoWalletService.getWalletData(walletId)

          if (!demoData) {
            const email = localStorage.getItem("user_email") || undefined
            const phone = localStorage.getItem("user_phone") || undefined
            demoData = DemoWalletService.initializeDemoWallet(walletId, email, phone)
            console.log("[v0] Initialized demo wallet with sample data")
          }

          setWalletData(demoData)
        } else {
          console.log("[v0] Attempting API call to fetch wallet data")
          const response = await fetch(`https://unbordered-production.up.railway.app/api/wallets/${walletId}`)

          if (response.ok) {
            const data = await response.json()
            setWalletData(data)
            console.log("[v0] Successfully fetched wallet data from API")
          } else {
            console.log("[v0] API call failed, switching to demo mode")
            localStorage.setItem("demo_mode", "true")
            setIsDemoMode(true)

            const email = localStorage.getItem("user_email") || undefined
            const phone = localStorage.getItem("user_phone") || undefined
            const demoData = DemoWalletService.initializeDemoWallet(walletId, email, phone)
            setWalletData(demoData)
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching wallet data:", error)
        console.log("[v0] Network error, switching to demo mode")
        localStorage.setItem("demo_mode", "true")
        setIsDemoMode(true)

        const email = localStorage.getItem("user_email") || undefined
        const phone = localStorage.getItem("user_phone") || undefined
        const demoData = DemoWalletService.initializeDemoWallet(walletId, email, phone)
        setWalletData(demoData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletData()
    if (!localStorage.getItem("demo_mode")) {
      const interval = setInterval(fetchWalletData, 30000)
      return () => {
        clearInterval(interval)
        RateService.stopRateUpdates()
      }
    }
  }, [])

  const refreshWalletData = () => {
    if (isDemoMode && walletData) {
      const updatedData = DemoWalletService.getWalletData(walletData.wallet_id)
      if (updatedData) {
        setWalletData(updatedData)
      }
    } else {
      window.location.reload()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground font-serif">Loading your wallet...</p>
        </div>
      </div>
    )
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground font-serif mb-4">Unable to load wallet data</p>
          <Button asChild>
            <Link href="/onboard">Create New Wallet</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-sans text-foreground">Borderless</span>
            {isDemoMode && (
              <Badge variant="secondary" className="text-xs">
                Demo Mode
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {walletData.email || walletData.phone}
            </Badge>
            <Button variant="ghost" size="sm">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Balance Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-sans text-foreground">Your Wallet</h1>
              <p className="text-muted-foreground font-serif">Manage your multi-currency balances</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-serif">Total Balance</p>
              <p className="text-3xl font-bold font-sans text-foreground">
                ${walletData.total_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {walletData.balances.map((balance) => (
              <Card key={balance.currency} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-sans">
                      {balance.currency}
                    </Badge>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-sans text-foreground">{balance.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground font-serif">
                      ≈ ${balance.usd_equivalent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setShowDepositModal(true)} className="font-sans">
              <Plus className="w-4 h-4 mr-2" />
              Deposit
            </Button>
            <Button variant="outline" onClick={() => setShowSwapModal(true)} className="font-sans">
              <RefreshCw className="w-4 h-4 mr-2" />
              Swap
            </Button>
            <Button variant="outline" onClick={() => setShowSendModal(true)} className="font-sans">
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="font-sans">
              Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="font-sans">
              History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="font-sans">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-sans">Recent Activity</CardTitle>
                  <CardDescription className="font-serif">Your latest transactions and transfers</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionHistory walletId={walletData.wallet_id} limit={5} isDemoMode={isDemoMode} />
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-sans">Balance Distribution</CardTitle>
                  <CardDescription className="font-serif">Your portfolio breakdown by currency</CardDescription>
                </CardHeader>
                <CardContent>
                  <BalanceChart balances={walletData.balances} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-sans">Transaction History</CardTitle>
                <CardDescription className="font-serif">Complete history of all your transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionHistory walletId={walletData.wallet_id} isDemoMode={isDemoMode} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-sans">Portfolio Performance</CardTitle>
                  <CardDescription className="font-serif">Track your balance changes over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground font-serif">Analytics coming soon...</div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-sans">Exchange Rate Trends</CardTitle>
                  <CardDescription className="font-serif">Monitor currency pair performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground font-serif">Rate trends coming soon...</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <DepositModal
        open={showDepositModal}
        onOpenChange={setShowDepositModal}
        onSuccess={refreshWalletData}
        isDemoMode={isDemoMode}
      />
      <SwapModal
        open={showSwapModal}
        onOpenChange={setShowSwapModal}
        balances={walletData.balances}
        onSuccess={refreshWalletData}
        isDemoMode={isDemoMode}
      />
      <SendModal
        open={showSendModal}
        onOpenChange={setShowSendModal}
        balances={walletData.balances}
        onSuccess={refreshWalletData}
        isDemoMode={isDemoMode}
      />
    </div>
  )
}
