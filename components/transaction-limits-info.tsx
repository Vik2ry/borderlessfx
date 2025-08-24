"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { TRANSACTION_LIMITS, CurrencyFormatter } from "@/lib/fintech-utils"

interface TransactionLimitsInfoProps {
  userTier?: "default" | "verified"
  className?: string
}

export function TransactionLimitsInfo({ userTier = "default", className }: TransactionLimitsInfoProps) {
  const limits = TRANSACTION_LIMITS[userTier]

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle className="font-sans">Transaction Limits</CardTitle>
          </div>
          <Badge variant={userTier === "verified" ? "default" : "secondary"}>
            {userTier === "verified" ? "Verified" : "Standard"}
          </Badge>
        </div>
        <CardDescription className="font-serif">
          Your current transaction limits for security and compliance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-card rounded-lg border">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold font-sans text-sm">Per Transaction</p>
              <p className="text-lg font-bold text-primary">
                {CurrencyFormatter.format(limits.perTransaction, "USDx")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-card rounded-lg border">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-semibold font-sans text-sm">Daily Limit</p>
              <p className="text-lg font-bold text-primary">{CurrencyFormatter.format(limits.daily, "USDx")}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-card rounded-lg border">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold font-sans text-sm">Monthly Limit</p>
              <p className="text-lg font-bold text-primary">{CurrencyFormatter.format(limits.monthly, "USDx")}</p>
            </div>
          </div>
        </div>

        {userTier === "default" && (
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold font-sans text-sm text-primary mb-1">Increase Your Limits</p>
                <p className="text-sm font-serif text-muted-foreground">
                  Complete identity verification to increase your limits up to $25,000 per transaction, $50,000 daily,
                  and $200,000 monthly.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
