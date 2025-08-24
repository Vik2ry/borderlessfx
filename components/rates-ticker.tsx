"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { RateService } from "@/lib/rate-service"

interface RateTickerProps {
  className?: string
}

export function RatesTicker({ className }: RateTickerProps) {
  const [rates, setRates] = useState<any>({})
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    setRates(RateService.getCurrentRates())
    setLastUpdated(RateService.getLastUpdated())

    const handleRateUpdate = (newRates: any) => {
      setRates(newRates)
      setLastUpdated(new Date())
    }

    RateService.addRateListener(handleRateUpdate)

    return () => {
      RateService.removeRateListener(handleRateUpdate)
    }
  }, [])

  const ratePairs = [
    { from: "USDx", to: "cNGN", symbol: "₦" },
    { from: "USDx", to: "cXAF", symbol: "₣" },
    { from: "EURx", to: "USDx", symbol: "$" },
    { from: "cNGN", to: "cXAF", symbol: "₣" },
  ]

  const getRateValue = (from: string, to: string) => {
    return RateService.getRate(from, to)
  }

  const formatRate = (rate: number, symbol: string) => {
    if (rate > 1) {
      return `${symbol}${rate.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    } else {
      return `${symbol}${rate.toFixed(6)}`
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold font-sans text-sm">Live Exchange Rates</h3>
          <Badge variant="secondary" className="text-xs">
            {lastUpdated.toLocaleTimeString()}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ratePairs.map((pair) => {
            const rate = getRateValue(pair.from, pair.to)
            return (
              <div key={`${pair.from}-${pair.to}`} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-serif">
                  {pair.from} → {pair.to}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold font-sans">{formatRate(rate, pair.symbol)}</span>
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
