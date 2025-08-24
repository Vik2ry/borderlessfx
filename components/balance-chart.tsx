"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface Balance {
  currency: string
  amount: number
  usd_equivalent: number
}

interface BalanceChartProps {
  balances: Balance[]
}

const COLORS = ["#15803d", "#84cc16", "#f59e0b", "#dc2626", "#ea580c"]

export function BalanceChart({ balances }: BalanceChartProps) {
  const chartData = balances
    .filter((balance) => balance.usd_equivalent > 0)
    .map((balance, index) => ({
      name: balance.currency,
      value: balance.usd_equivalent,
      amount: balance.amount,
      color: COLORS[index % COLORS.length],
    }))

  if (chartData.length === 0) {
    return <div className="text-center py-8 text-muted-foreground font-serif">No balance data to display</div>
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold font-sans text-foreground">{data.name}</p>
          <p className="text-sm font-serif text-muted-foreground">
            {data.amount.toLocaleString()} {data.name}
          </p>
          <p className="text-sm font-serif text-muted-foreground">
            ${data.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="font-serif text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
