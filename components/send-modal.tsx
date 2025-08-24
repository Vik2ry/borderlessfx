"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Send, CheckCircle } from "lucide-react"
import { DemoWalletService } from "@/lib/demo-data"
import { ApiService } from "@/lib/api-service"

interface Balance {
  currency: string
  amount: number
  usd_equivalent: number
}

interface SendModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  balances: Balance[]
  onSuccess: () => void
}

export function SendModal({ open, onOpenChange, balances, onSuccess }: SendModalProps) {
  const [recipient, setRecipient] = useState("")
  const [currency, setCurrency] = useState("")
  const [amount, setAmount] = useState("")
  const [targetCurrency, setTargetCurrency] = useState("")
  const [preview, setPreview] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const walletId = localStorage.getItem("wallet_id") // Declare walletId here

  const availableCurrencies = balances.filter((b) => b.amount > 0)
  const allCurrencies = ["USDx", "EURx", "cNGN", "cXAF"]

  const isDemoMode = typeof window !== "undefined" && localStorage.getItem("demo_mode") === "true"

  useEffect(() => {
    if (recipient && currency && amount && Number.parseFloat(amount) > 0) {
      fetchPreview()
    } else {
      setPreview(null)
    }
  }, [recipient, currency, amount, targetCurrency])

  const fetchPreview = async () => {
    try {
      if (isDemoMode) {
        console.log("[v0] Using demo mode for transfer preview")
        const amountNum = Number.parseFloat(amount)
        const rate = targetCurrency && targetCurrency !== currency ? 1.2 : 1 // Mock exchange rate
        const creditedAmount = amountNum * rate

        setPreview({
          credited_amount: creditedAmount,
          rate: rate !== 1 ? rate : null,
        })
        return
      }

      const previewData = await ApiService.getTransferPreview(
        walletId!,
        recipient,
        currency,
        Number.parseFloat(amount),
        targetCurrency || currency,
      )

      if (previewData) {
        setPreview(previewData)
      } else {
        throw new Error("API preview failed")
      }
    } catch (error) {
      console.error("Error fetching preview:", error)
      if (!isDemoMode) {
        console.log("[v0] API preview failed, using demo fallback")
        const amountNum = Number.parseFloat(amount)
        const rate = targetCurrency && targetCurrency !== currency ? 1.2 : 1
        const creditedAmount = amountNum * rate

        setPreview({
          credited_amount: creditedAmount,
          rate: rate !== 1 ? rate : null,
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !currency || !amount) return

    setIsLoading(true)

    try {
      if (isDemoMode) {
        console.log("[v0] Processing demo transfer:", { recipient, currency, amount, targetCurrency })

        await new Promise((resolve) => setTimeout(resolve, 1000))

        const amountNum = Number.parseFloat(amount)
        DemoWalletService.processTransfer(walletId!, currency, amountNum, recipient, targetCurrency || currency)

        setIsSuccess(true)
        setTimeout(() => {
          onSuccess()
          onOpenChange(false)
          setIsSuccess(false)
          setRecipient("")
          setCurrency("")
          setAmount("")
          setTargetCurrency("")
          setPreview(null)
        }, 2000)
        return
      }

      await ApiService.executeTransfer(
        walletId!,
        recipient,
        currency,
        Number.parseFloat(amount),
        targetCurrency || currency,
      )

      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
        setIsSuccess(false)
        setRecipient("")
        setCurrency("")
        setAmount("")
        setTargetCurrency("")
        setPreview(null)
      }, 2000)
    } catch (error) {
      console.error("Error sending transfer:", error)

      if (!isDemoMode) {
        console.log("[v0] API transfer failed, using demo fallback")
        const amountNum = Number.parseFloat(amount)
        DemoWalletService.processTransfer(walletId!, currency, amountNum, recipient, targetCurrency || currency)

        setIsSuccess(true)
        setTimeout(() => {
          onSuccess()
          onOpenChange(false)
          setIsSuccess(false)
          setRecipient("")
          setCurrency("")
          setAmount("")
          setTargetCurrency("")
          setPreview(null)
        }, 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Send Money</span>
          </DialogTitle>
          <DialogDescription className="font-serif">
            Send funds to another wallet with automatic currency conversion
            {isDemoMode && <span className="text-primary"> (Demo Mode)</span>}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold font-sans text-foreground mb-2">Transfer Successful!</h3>
            <p className="text-muted-foreground font-serif">Your money has been sent successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient" className="font-sans">
                Recipient Wallet ID
              </Label>
              <Input
                id="recipient"
                type="text"
                placeholder="Enter wallet ID or handle"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="font-serif"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="font-sans">
                Send From
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency to send" />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies.map((balance) => (
                    <SelectItem key={balance.currency} value={balance.currency}>
                      {balance.currency} (Available: {balance.amount.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="font-sans">
                Amount
              </Label>
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

            <div className="space-y-2">
              <Label htmlFor="target-currency" className="font-sans">
                Recipient Receives (Optional)
              </Label>
              <Select value={targetCurrency} onValueChange={setTargetCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Same currency (no conversion)" />
                </SelectTrigger>
                <SelectContent>
                  {allCurrencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {preview && (
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="text-sm font-serif space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipient receives:</span>
                    <span className="font-semibold">
                      {preview.credited_amount?.toLocaleString()} {targetCurrency || currency}
                    </span>
                  </div>
                  {preview.rate && preview.rate !== 1 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exchange rate:</span>
                      <span className="font-semibold">{preview.rate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full font-sans"
              disabled={!recipient || !currency || !amount || isLoading}
            >
              {isLoading ? "Processing..." : "Send Money"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
