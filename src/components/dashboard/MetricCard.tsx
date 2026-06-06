import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  sparkline?: { v: number }[]
  simple?: boolean
  className?: string
}

export function MetricCard({ label, value, trend, trendUp = true, sparkline, simple = false, className }: MetricCardProps) {
  const data = sparkline ?? [{ v: 3 }, { v: 5 }, { v: 4 }, { v: 7 }, { v: 6 }, { v: 9 }, { v: 8 }]

  return (
    <div className={cn('rounded-2xl border border-border/60 bg-card shadow-sm', simple ? 'p-4' : 'p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn('mt-1 font-bold tracking-tight', simple ? 'text-xl' : 'text-2xl')}>{value}</p>
          {simple && trend && (
            <p className={cn('mt-1 text-xs font-medium', trendUp ? 'text-emerald-600' : 'text-rose-600')}>{trend}</p>
          )}
        </div>
        {!simple && trend && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
              trendUp
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
            )}
          >
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>
      {!simple && (
        <div className="mt-4 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--primary)"
                fill={`url(#spark-${label})`}
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
