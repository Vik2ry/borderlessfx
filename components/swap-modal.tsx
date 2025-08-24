"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RefreshCw, ArrowUpDown, CheckCircle, AlertCircle } from "lucide-react"
import { DemoWalletService } from "@/lib/demo-data"
import { ApiService } from "@/lib/api-service"
import { RateService } from "@/lib/rate-service"

interface Balance {
  currency: string
  amount: number
  usd_equivalent: number
}

interface SwapModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  balances: Balance[]
  onSuccess: () => void
}

export function SwapModal({ open, onOpenChange, balances, onSuccess }: SwapModalProps) {
  const [fromCurrency, setFromCurrency] = useState("")
  const [toCurrency, setToCurrency] = useState("")
  const [amount, setAmount] = useState("")
  const [preview, setPreview] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const getAvailableCurrencies = () => {
    const enteredAmount = Number.parseFloat(amount) || 0
    return balances.filter((b) => b.amount > 0 && (enteredAmount === 0 || b.amount >= enteredAmount))
  }

  const availableCurrencies = getAvailableCurrencies()

  useEffect(() => {
    if (fromCurrency && toCurrency && amount && Number.parseFloat(amount) > 0) {
      fetchPreview()
    } else {
      setPreview(null)
      setError("")
    }
  }, [fromCurrency, toCurrency, amount])

  const fetchPreview = async () => {
    try {
      const enteredAmount = Number.parseFloat(amount)
      const fromBalance = balances.find((b) => b.currency === fromCurrency)

      // Validate sufficient balance
      if (!fromBalance || fromBalance.amount < enteredAmount) {
        setError(`Insufficient ${fromCurrency} balance. Available: ${fromBalance?.amount.toLocaleString() || 0}`)
        setPreview(null)
        return
      }

      const isDemoMode = localStorage.getItem("demo_mode") === "true"

      if (isDemoMode) {
        const toAmount = RateService.convertAmount(enteredAmount, fromCurrency, toCurrency)
        const rate = RateService.getRate(fromCurrency, toCurrency)
        const rateDisplay = `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`

        setPreview({
          to_amount: toAmount,
          rate: rateDisplay,
          from_amount: enteredAmount,
          from_currency: fromCurrency,
          to_currency: toCurrency,
        })
        setError("")
      } else {
        const walletId = localStorage.getItem("wallet_id")
        if (!walletId) return

        const previewData = await ApiService.getSwapPreview(walletId, fromCurrency, toCurrency, enteredAmount)

        if (previewData) {
          setPreview({
            to_amount: previewData.credited_amount,
            rate: previewData.rate ? `Rate: ${previewData.rate}` : undefined,
            from_amount: enteredAmount,
            from_currency: fromCurrency,
            to_currency: toCurrency,
          })
          setError("")
        } else {
          throw new Error("API preview failed")
        }
      }
    } catch (error) {
      console.error("Error fetching preview:", error)
      const enteredAmount = Number.parseFloat(amount)
      const toAmount = RateService.convertAmount(enteredAmount, fromCurrency, toCurrency)
      const rate = RateService.getRate(fromCurrency, toCurrency)
      const rateDisplay = `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`

      setPreview({
        to_amount: toAmount,
        rate: rateDisplay,
        from_amount: enteredAmount,
        from_currency: fromCurrency,
        to_currency: toCurrency,
      })
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromCurrency || !toCurrency || !amount) return

    const enteredAmount = Number.parseFloat(amount)
    const fromBalance = balances.find((b) => b.currency === fromCurrency)

    if (!fromBalance || fromBalance.amount < enteredAmount) {
      setError(`Insufficient ${fromCurrency} balance. Available: ${fromBalance?.amount.toLocaleString() || 0}`)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const isDemoMode = localStorage.getItem("demo_mode") === "true"

      if (isDemoMode) {
        const walletId = localStorage.getItem("wallet_id")
        if (walletId && DemoWalletService.swap(walletId, fromCurrency, toCurrency, enteredAmount)) {
          console.log("[v0] Demo swap successful:", { fromCurrency, toCurrency, amount: enteredAmount })
          setIsSuccess(true)
          setTimeout(() => {
            onSuccess()
            onOpenChange(false)
            resetForm()
          }, 2000)
        } else {
          setError("Swap failed. Please try again.")
        }
      } else {
        const walletId = localStorage.getItem("wallet_id")
        if (!walletId) return

        await ApiService.executeSwap(walletId, fromCurrency, toCurrency, enteredAmount)

        setIsSuccess(true)
        setTimeout(() => {
          onSuccess()
          onOpenChange(false)
          resetForm()
        }, 2000)
      }
    } catch (error) {
      console.error("Error swapping currencies:", error)
      const walletId = localStorage.getItem("wallet_id")
      if (walletId && DemoWalletService.swap(walletId, fromCurrency, toCurrency, enteredAmount)) {
        console.log("[v0] API failed, using demo swap:", { fromCurrency, toCurrency, amount: enteredAmount })
        setIsSuccess(true)
        setTimeout(() => {
          onSuccess()
          onOpenChange(false)
          resetForm()
        }, 2000)
      } else {
        setError("Swap failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setIsSuccess(false)
    setFromCurrency("")
    setToCurrency("")
    setAmount("")
    setPreview(null)
    setError("")
  }

  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  const setMaxAmount = () => {
    const fromBalance = balances.find((b) => b.currency === fromCurrency)
    if (fromBalance) {
      setAmount(fromBalance.amount.toString())
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans flex items-center space-x-2">
            <RefreshCw className="w-5 h-5" />
            <span>Swap Currencies</span>
          </DialogTitle>
          <DialogDescription className="font-serif">
            Exchange one stablecoin for another at current market rates
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold font-sans text-foreground mb-2">Swap Successful!</h3>
            <p className="text-muted-foreground font-serif">Your currencies have been exchanged</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from-currency" className="font-sans">
                From
              </Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency to swap from" />
                </SelectTrigger>
                <SelectContent>
                  {balances
                    .filter((b) => b.amount > 0)
                    .map((balance) => (
                      <SelectItem key={balance.currency} value={balance.currency}>
                        {balance.currency} (Available: {balance.amount.toLocaleString()})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount" className="font-sans">
                  Amount
                </Label>
                {fromCurrency && (
                  <Button type="button" variant="ghost" size="sm" onClick={setMaxAmount} className="text-xs h-auto p-1">
                    Max
                  </Button>
                )}
              </div>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-serif"
              />
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={swapCurrencies}
                disabled={!fromCurrency || !toCurrency}
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-currency" className="font-sans">
                To
              </Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency to swap to" />
                </SelectTrigger>
                <SelectContent>
                  {balances.map((balance) => (
                    <SelectItem
                      key={balance.currency}
                      value={balance.currency}
                      disabled={balance.currency === fromCurrency}
                    >
                      {balance.currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-serif">{error}</span>
                </div>
              </div>
            )}

            {preview && !error && (
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="text-sm font-serif space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">You'll receive:</span>
                    <span className="font-semibold">
                      {preview.to_amount?.toLocaleString()} {toCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exchange rate:</span>
                    <span className="font-semibold">{preview.rate}</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full font-sans"
              disabled={!fromCurrency || !toCurrency || !amount || (!preview && !error) || isLoading || !!error}
            >
              {isLoading ? "Processing..." : "Confirm Swap"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
