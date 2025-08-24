"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, CheckCircle } from "lucide-react"
import { DemoWalletService } from "@/lib/demo-data"

interface DepositModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  isDemoMode?: boolean
}

const CURRENCIES = [
  { value: "USDx", label: "USDx - US Dollar Stablecoin" },
  { value: "EURx", label: "EURx - Euro Stablecoin" },
  { value: "cNGN", label: "cNGN - Nigerian Naira Stablecoin" },
  { value: "cXAF", label: "cXAF - CFA Franc Stablecoin" },
]

export function DepositModal({ open, onOpenChange, onSuccess, isDemoMode = false }: DepositModalProps) {
  const [currency, setCurrency] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currency || !amount) return

    setIsLoading(true)

    try {
      const walletId = localStorage.getItem("wallet_id")
      if (!walletId) return

      if (isDemoMode) {
        console.log("[v0] Processing demo deposit:", { currency, amount })
        const success = DemoWalletService.deposit(walletId, currency, Number.parseFloat(amount))

        if (success) {
          setIsSuccess(true)
          setTimeout(() => {
            onSuccess()
            onOpenChange(false)
            setIsSuccess(false)
            setCurrency("")
            setAmount("")
          }, 2000)
        }
      } else {
        const response = await fetch("https://unbordered-production.up.railway.app/api/deposit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet_id: walletId,
            currency,
            amount: Number.parseFloat(amount),
          }),
        })

        if (response.ok) {
          setIsSuccess(true)
          setTimeout(() => {
            onSuccess()
            onOpenChange(false)
            setIsSuccess(false)
            setCurrency("")
            setAmount("")
          }, 2000)
        }
      }
    } catch (error) {
      console.error("Error depositing funds:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Deposit Funds</span>
          </DialogTitle>
          <DialogDescription className="font-serif">
            Add funds to your wallet by selecting a currency and amount
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold font-sans text-foreground mb-2">Deposit Successful!</h3>
            <p className="text-muted-foreground font-serif">Your wallet balance has been updated</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency" className="font-sans">
                Currency
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
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

            <Button type="submit" className="w-full font-sans" disabled={!currency || !amount || isLoading}>
              {isLoading ? "Processing..." : "Deposit Funds"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
