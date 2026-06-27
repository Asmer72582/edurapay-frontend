import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Calculator, IndianRupee, Receipt, RotateCcw, TrendingUp, Users } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const defaults = {
  students: 50_000,
  txnsPerStudent: 5,
  feePerTxn: 22.6,
  years: 5,
}

function formatInr(n: number): string {
  if (!Number.isFinite(n)) return '₹0'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`
  return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`
}

function formatCount(n: number): string {
  if (!Number.isFinite(n)) return '0'
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(2).replace(/\.?0+$/, '')} lakh`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toLocaleString('en-IN')
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  step = 1,
  min = 0,
  hint,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  suffix?: string
  step?: number
  min?: number
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-10 rounded-lg pr-12 font-semibold tabular-nums"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Users
  label: string
  value: string
  sub?: string
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 text-xl font-bold tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  )
}

export function RevenueSimulatorPage() {
  const [students, setStudents] = useState(defaults.students)
  const [txnsPerStudent, setTxnsPerStudent] = useState(defaults.txnsPerStudent)
  const [feePerTxn, setFeePerTxn] = useState(defaults.feePerTxn)
  const [years, setYears] = useState(defaults.years)

  const reset = () => {
    setStudents(defaults.students)
    setTxnsPerStudent(defaults.txnsPerStudent)
    setFeePerTxn(defaults.feePerTxn)
    setYears(defaults.years)
  }

  const calc = useMemo(() => {
    const totalTxns = students * txnsPerStudent
    const earningsYear = totalTxns * feePerTxn
    const earningsPerStudent = txnsPerStudent * feePerTxn

    return { totalTxns, earningsYear, earningsPerStudent }
  }, [students, txnsPerStudent, feePerTxn])

  const multiYear = useMemo(() => {
    return Array.from({ length: Math.max(1, Math.min(20, years)) }, (_, i) => {
      const y = i + 1
      return {
        year: `Year ${y}`,
        Transactions: calc.totalTxns * y,
        Earnings: calc.earningsYear * y,
      }
    })
  }, [calc, years])

  const feeSensitivity = useMemo(() => {
    return [10, 15, 20, 25, 30, 40, 50].map((fee) => ({
      fee: `₹${fee}`,
      feeVal: fee,
      earningsYear: calc.totalTxns * fee,
    }))
  }, [calc.totalTxns])

  const txnSensitivity = useMemo(() => {
    return [2, 3, 4, 5, 6, 8, 10].map((txns) => ({
      txns: `${txns}/yr`,
      txnsVal: txns,
      totalTxns: students * txns,
      earningsYear: students * txns * feePerTxn,
    }))
  }, [students, feePerTxn])

  const scaleSnapshots = useMemo(() => {
    return [10_000, 25_000, 50_000, 75_000, 100_000, 250_000].map((n) => ({
      students: n,
      totalTxns: n * txnsPerStudent,
      earningsYear: n * txnsPerStudent * feePerTxn,
    }))
  }, [txnsPerStudent, feePerTxn])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue simulator"
        description="Estimate EduraPay earnings from per-transaction fees — students × transactions × charge. Test only — not stored anywhere."
        crumbs={[{ label: 'Workspace', to: '/app/super-admin' }, { label: 'Revenue simulator' }]}
        actions={
          <Button variant="outline" className="rounded-lg" onClick={reset}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Reset
          </Button>
        }
      />

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center gap-2">
          <Calculator className="h-4 w-4 text-violet-600" />
          <CardTitle className="text-base">Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField
              label="Total students"
              value={students}
              onChange={(n) => setStudents(Math.max(0, Math.floor(n || 0)))}
              suffix="kids"
              min={0}
              hint="Active students on the platform"
            />
            <NumberField
              label="Transactions per student"
              value={txnsPerStudent}
              onChange={(n) => setTxnsPerStudent(Math.max(0, n || 0))}
              suffix="/ year"
              step={0.5}
              min={0}
              hint="Fee payments, instalments, etc. per student"
            />
            <NumberField
              label="Fee per transaction"
              value={feePerTxn}
              onChange={(n) => setFeePerTxn(Math.max(0, n || 0))}
              suffix="₹"
              step={1}
              min={0}
              hint="EduraPay charge on each transaction"
            />
            <NumberField
              label="Years to project"
              value={years}
              onChange={(n) => setYears(Math.max(1, Math.min(20, n)))}
              suffix="yrs"
              min={1}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-violet-200/80 bg-violet-50/40 dark:border-violet-900/50 dark:bg-violet-950/20">
        <CardContent className="space-y-3 pt-6 text-sm">
          <p className="font-semibold text-foreground">If you reach:</p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">{students.toLocaleString('en-IN')}</span> students
            </li>
            <li>
              <span className="font-semibold text-foreground">{txnsPerStudent}</span> transactions / student / year
            </li>
          </ul>
          <p className="border-t border-violet-200/60 pt-3 dark:border-violet-800/60">
            <span className="font-semibold text-foreground">Transactions</span> ={' '}
            <span className="font-bold tabular-nums text-violet-700 dark:text-violet-300">
              {formatCount(calc.totalTxns)}
            </span>{' '}
            <span className="text-muted-foreground">({calc.totalTxns.toLocaleString('en-IN')} / year)</span>
          </p>
          <p>
            <span className="font-semibold text-foreground">Your earnings</span> ={' '}
            <span className="font-bold tabular-nums text-violet-700 dark:text-violet-300">
              {formatCount(calc.totalTxns)} × ₹{feePerTxn}
            </span>{' '}
            ={' '}
            <span className="text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              {formatInr(calc.earningsYear)} / year
            </span>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Users}
          label="Students"
          value={students.toLocaleString('en-IN')}
          sub="On platform"
          accent="bg-violet-100 text-violet-700"
        />
        <StatTile
          icon={Receipt}
          label="Transactions / year"
          value={calc.totalTxns.toLocaleString('en-IN')}
          sub={`${students.toLocaleString('en-IN')} × ${txnsPerStudent} txns`}
          accent="bg-blue-100 text-blue-700"
        />
        <StatTile
          icon={IndianRupee}
          label="Fee / transaction"
          value={`₹${feePerTxn}`}
          sub="Flat charge per payment"
          accent="bg-amber-100 text-amber-700"
        />
        <StatTile
          icon={TrendingUp}
          label="EduraPay earnings / year"
          value={formatInr(calc.earningsYear)}
          sub={`₹${calc.earningsPerStudent.toLocaleString('en-IN')} per student / year`}
          accent="bg-emerald-100 text-emerald-700"
        />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Breakdown · per year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Metric</th>
                  <th className="pb-2 pr-4 text-right">Value</th>
                  <th className="pb-2 text-right">Formula</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4 font-medium">Students</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{students.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right text-muted-foreground">—</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4 font-medium">Transactions per student</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{txnsPerStudent}</td>
                  <td className="py-3 text-right text-muted-foreground">per year</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4 font-medium">Total transactions</td>
                  <td className="py-3 pr-4 text-right font-semibold tabular-nums">
                    {calc.totalTxns.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">
                    {students.toLocaleString('en-IN')} × {txnsPerStudent}
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4 font-medium">Fee per transaction</td>
                  <td className="py-3 pr-4 text-right tabular-nums">₹{feePerTxn}</td>
                  <td className="py-3 text-right text-muted-foreground">flat fee</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-emerald-700">EduraPay earnings</td>
                  <td className="py-3 pr-4 text-right text-lg font-bold tabular-nums text-emerald-700">
                    {formatInr(calc.earningsYear)}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">
                    {calc.totalTxns.toLocaleString('en-IN')} × ₹{feePerTxn}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Earnings projection · {years} years</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={multiYear}>
                  <defs>
                    <linearGradient id="gEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" vertical={false} />
                  <XAxis dataKey="year" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(v) => formatInr(v)} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid oklch(0.922 0 0)',
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(v: number, name: string) => [
                      name === 'Earnings' ? formatInr(v) : v.toLocaleString('en-IN'),
                      name,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="Earnings"
                    stroke="#10b981"
                    fill="url(#gEarnings)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Fee sensitivity · ₹ per transaction</CardTitle>
            <p className="text-xs text-muted-foreground">
              At {students.toLocaleString('en-IN')} students × {txnsPerStudent} txns / year
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeSensitivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" vertical={false} />
                  <XAxis dataKey="fee" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(v) => formatInr(v)} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid oklch(0.922 0 0)',
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => formatInr(v)}
                  />
                  <Bar dataKey="earningsYear" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Transactions sensitivity · per student / year</CardTitle>
          <p className="text-xs text-muted-foreground">
            At {students.toLocaleString('en-IN')} students · ₹{feePerTxn} per transaction
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Txns / student</th>
                  <th className="pb-2 pr-4 text-right">Total transactions / yr</th>
                  <th className="pb-2 pr-4 text-right">Earnings / yr</th>
                </tr>
              </thead>
              <tbody>
                {txnSensitivity.map((row) => (
                  <tr
                    key={row.txns}
                    className={`border-b border-border/60 last:border-0 ${
                      row.txnsVal === txnsPerStudent ? 'bg-violet-50/60 dark:bg-violet-950/20' : ''
                    }`}
                  >
                    <td className="py-2 pr-4 font-semibold">
                      {row.txns}
                      {row.txnsVal === txnsPerStudent && (
                        <span className="ml-2 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          current
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">{row.totalTxns.toLocaleString('en-IN')}</td>
                    <td className="py-2 pr-4 text-right font-semibold tabular-nums text-emerald-700">
                      {formatInr(row.earningsYear)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <CardTitle className="text-base">Scale snapshots · by student count</CardTitle>
          <p className="text-xs text-muted-foreground">
            {txnsPerStudent} txns / student · ₹{feePerTxn} per transaction
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Students</th>
                  <th className="pb-2 pr-4 text-right">Transactions / yr</th>
                  <th className="pb-2 pr-4 text-right">Earnings / yr</th>
                </tr>
              </thead>
              <tbody>
                {scaleSnapshots.map((row) => (
                  <tr
                    key={row.students}
                    className={`border-b border-border/60 last:border-0 ${
                      row.students === students ? 'bg-violet-50/60 dark:bg-violet-950/20' : ''
                    }`}
                  >
                    <td className="py-2 pr-4 font-semibold">
                      {row.students.toLocaleString('en-IN')}
                      {row.students === students && (
                        <span className="ml-2 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          current
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">{row.totalTxns.toLocaleString('en-IN')}</td>
                    <td className="py-2 pr-4 text-right font-semibold tabular-nums text-emerald-700">
                      {formatInr(row.earningsYear)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Multi-year cumulative</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Year</th>
                  <th className="pb-2 pr-4 text-right">Cumulative transactions</th>
                  <th className="pb-2 pr-4 text-right">Cumulative earnings</th>
                </tr>
              </thead>
              <tbody>
                {multiYear.map((row) => (
                  <tr key={row.year} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-4 font-semibold">{row.year}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{row.Transactions.toLocaleString('en-IN')}</td>
                    <td className="py-2 pr-4 text-right font-semibold tabular-nums text-emerald-700">
                      {formatInr(row.Earnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
