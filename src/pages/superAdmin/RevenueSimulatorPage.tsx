import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Building2,
  Calculator,
  CreditCard,
  Landmark,
  RotateCcw,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const defaults = {
  institutes: 1,
  students: 350,
  baseFee: 30000,
  markupPct: 3,
  mdrPct: 2.36,
  collectionRate: 100,
  years: 5,
}

function formatInr(n: number): string {
  if (!Number.isFinite(n)) return '₹0'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`
  return `${sign}₹${Math.round(n).toLocaleString('en-IN')}`
}

function formatPlain(n: number): string {
  if (!Number.isFinite(n)) return '₹0'
  const rounded = Math.round(n)
  return `₹${rounded.toLocaleString('en-IN')}`
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
  icon: typeof Wallet
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
  const [inst, setInst] = useState(defaults.institutes)
  const [students, setStudents] = useState(defaults.students)
  const [baseFee, setBaseFee] = useState(defaults.baseFee)
  const [markupPct, setMarkupPct] = useState(defaults.markupPct)
  const [mdrPct, setMdrPct] = useState(defaults.mdrPct)
  const [collectionRate, setCollectionRate] = useState(defaults.collectionRate)
  const [years, setYears] = useState(defaults.years)

  const reset = () => {
    setInst(defaults.institutes)
    setStudents(defaults.students)
    setBaseFee(defaults.baseFee)
    setMarkupPct(defaults.markupPct)
    setMdrPct(defaults.mdrPct)
    setCollectionRate(defaults.collectionRate)
    setYears(defaults.years)
  }

  const calc = useMemo(() => {
    const markup = baseFee * (markupPct / 100)
    const studentGross = baseFee + markup
    const mdrPerStudent = studentGross * (mdrPct / 100)
    const eduraPerStudent = markup - mdrPerStudent

    const collected = collectionRate / 100

    const collegePerInstYear = baseFee * students * collected
    const grossPerInstYear = studentGross * students * collected
    const mdrPerInstYear = mdrPerStudent * students * collected
    const eduraPerInstYear = eduraPerStudent * students * collected
    const markupPerInstYear = markup * students * collected

    const collegeTotalYear = collegePerInstYear * inst
    const grossTotalYear = grossPerInstYear * inst
    const mdrTotalYear = mdrPerInstYear * inst
    const eduraTotalYear = eduraPerInstYear * inst

    return {
      perStudent: {
        base: baseFee,
        markup,
        studentGross,
        mdr: mdrPerStudent,
        edura: eduraPerStudent,
      },
      perInstYear: {
        college: collegePerInstYear,
        gross: grossPerInstYear,
        mdr: mdrPerInstYear,
        edura: eduraPerInstYear,
        markup: markupPerInstYear,
      },
      platformYear: {
        college: collegeTotalYear,
        gross: grossTotalYear,
        mdr: mdrTotalYear,
        edura: eduraTotalYear,
      },
    }
  }, [inst, students, baseFee, markupPct, mdrPct, collectionRate])

  const multiYear = useMemo(() => {
    return Array.from({ length: Math.max(1, Math.min(20, years)) }, (_, i) => {
      const y = i + 1
      return {
        year: `Y${y}`,
        College: calc.platformYear.college * y,
        Razorpay: calc.platformYear.mdr * y,
        EduraPay: calc.platformYear.edura * y,
      }
    })
  }, [calc, years])

  const sensitivity = useMemo(() => {
    return [2, 2.5, 3, 3.5, 4, 5].map((m) => {
      const markup = baseFee * (m / 100)
      const gross = baseFee + markup
      const mdr = gross * (mdrPct / 100)
      const edura = markup - mdr
      return {
        markup: `${m}%`,
        markupVal: m,
        perStudent: edura,
        perInstYear: edura * students * (collectionRate / 100),
        platformYear: edura * students * (collectionRate / 100) * inst,
      }
    })
  }, [baseFee, mdrPct, students, inst, collectionRate])

  const splitPie = [
    { name: 'College', value: calc.platformYear.college, color: '#7c3aed' },
    { name: 'Razorpay MDR', value: calc.platformYear.mdr, color: '#f43f5e' },
    { name: 'EduraPay net', value: calc.platformYear.edura, color: '#10b981' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue simulator"
        description="Tweak inputs and see how revenue splits between colleges, Razorpay, and EduraPay. Test only — not stored anywhere."
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
              label="Institutes"
              value={inst}
              onChange={(n) => setInst(Math.max(1, Math.floor(n || 1)))}
              suffix="orgs"
              min={1}
            />
            <NumberField
              label="Students per institute"
              value={students}
              onChange={(n) => setStudents(Math.max(1, Math.floor(n || 1)))}
              suffix="kids"
              min={1}
            />
            <NumberField
              label="Avg annual fee (base)"
              value={baseFee}
              onChange={setBaseFee}
              suffix="₹"
              step={1000}
              min={0}
            />
            <NumberField
              label="Years to project"
              value={years}
              onChange={(n) => setYears(Math.max(1, Math.min(20, n)))}
              suffix="yrs"
              min={1}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField
              label="EduraPay markup"
              value={markupPct}
              onChange={setMarkupPct}
              suffix="%"
              step={0.1}
              min={0}
              hint="Silently added on top of base fee"
            />
            <NumberField
              label="Razorpay MDR"
              value={mdrPct}
              onChange={setMdrPct}
              suffix="%"
              step={0.01}
              min={0}
              hint="Deducted from gross student payment"
            />
            <NumberField
              label="Collection rate"
              value={collectionRate}
              onChange={(n) => setCollectionRate(Math.max(0, Math.min(100, n)))}
              suffix="%"
              step={5}
              min={0}
              hint="What % of students actually pay this year"
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Platform total · {inst} institute{inst === 1 ? '' : 's'} × {students} students × 1 year
          </h3>
          <span className="text-[11px] text-muted-foreground">
            Scales with institutes & students live
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={Users}
            label="Students gross paid"
            value={formatInr(calc.platformYear.gross)}
            sub={`${(students * inst).toLocaleString('en-IN')} students × ${formatPlain(calc.perStudent.studentGross)}`}
            accent="bg-violet-100 text-violet-700"
          />
          <StatTile
            icon={Landmark}
            label="College pool"
            value={formatInr(calc.platformYear.college)}
            sub={`${((calc.platformYear.college / Math.max(1, calc.platformYear.gross)) * 100).toFixed(2)}% of gross`}
            accent="bg-blue-100 text-blue-700"
          />
          <StatTile
            icon={CreditCard}
            label="Razorpay take"
            value={formatInr(calc.platformYear.mdr)}
            sub={`${mdrPct.toFixed(2)}% MDR on gross`}
            accent="bg-rose-100 text-rose-700"
          />
          <StatTile
            icon={Wallet}
            label="EduraPay net"
            value={formatInr(calc.platformYear.edura)}
            sub={
              calc.platformYear.edura >= 0
                ? `Margin ${((calc.platformYear.edura / Math.max(1, baseFee * students * inst * (collectionRate / 100))) * 100).toFixed(2)}% of base`
                : 'Loss — markup is too low'
            }
            accent={
              calc.platformYear.edura >= 0
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
            }
          />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Per student · per year
          </h3>
          <span className="text-[11px] text-muted-foreground">Fixed — depends only on base fee & rates</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={Users}
            label="Student pays"
            value={formatPlain(calc.perStudent.studentGross)}
            sub={`Base + ${markupPct.toFixed(2)}% markup`}
            accent="bg-violet-100 text-violet-700"
          />
          <StatTile
            icon={Landmark}
            label="College"
            value={formatPlain(calc.perStudent.base)}
            sub="Base fee unchanged"
            accent="bg-blue-100 text-blue-700"
          />
          <StatTile
            icon={CreditCard}
            label="Razorpay"
            value={formatPlain(calc.perStudent.mdr)}
            sub={`${mdrPct.toFixed(2)}% on gross`}
            accent="bg-rose-100 text-rose-700"
          />
          <StatTile
            icon={Wallet}
            label="EduraPay"
            value={formatPlain(calc.perStudent.edura)}
            sub={calc.perStudent.edura >= 0 ? 'Net margin' : 'Loss — markup too low'}
            accent={calc.perStudent.edura >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}
          />
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Detailed breakdown · per year</CardTitle>
          <p className="text-xs text-muted-foreground">
            Collection rate {collectionRate}% applied. Platform column = per-institute × {inst} institute
            {inst === 1 ? '' : 's'}.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Bucket</th>
                  <th className="pb-2 pr-4 text-right">Per student</th>
                  <th className="pb-2 pr-4 text-right">Per institute ({students})</th>
                  <th className="pb-2 pr-4 text-right">Platform ({inst} × {students})</th>
                  <th className="pb-2 pr-4 text-right">% of gross</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: 'Student paid (gross)',
                    perS: calc.perStudent.studentGross,
                    perI: calc.perInstYear.gross,
                    platform: calc.platformYear.gross,
                    tone: '',
                  },
                  {
                    label: 'College received',
                    perS: calc.perStudent.base,
                    perI: calc.perInstYear.college,
                    platform: calc.platformYear.college,
                    tone: 'text-violet-700',
                  },
                  {
                    label: 'Razorpay MDR',
                    perS: calc.perStudent.mdr,
                    perI: calc.perInstYear.mdr,
                    platform: calc.platformYear.mdr,
                    tone: 'text-rose-600',
                  },
                  {
                    label: 'EduraPay net',
                    perS: calc.perStudent.edura,
                    perI: calc.perInstYear.edura,
                    platform: calc.platformYear.edura,
                    tone: calc.perStudent.edura >= 0 ? 'text-emerald-600' : 'text-rose-600',
                  },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4 font-medium">{row.label}</td>
                    <td className={`py-3 pr-4 text-right tabular-nums ${row.tone}`}>{formatPlain(row.perS)}</td>
                    <td className={`py-3 pr-4 text-right tabular-nums ${row.tone}`}>{formatPlain(row.perI)}</td>
                    <td className={`py-3 pr-4 text-right font-semibold tabular-nums ${row.tone}`}>{formatInr(row.platform)}</td>
                    <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                      {calc.perInstYear.gross > 0 ? ((row.perI / calc.perInstYear.gross) * 100).toFixed(2) : '0.00'}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Platform projection · {inst} institute(s) × {years} yr</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={multiYear}>
                  <defs>
                    <linearGradient id="gCollege" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gRzp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gEdura" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(v: number, name: string) => [formatInr(v), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="College" stroke="#7c3aed" fill="url(#gCollege)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Razorpay" stroke="#f43f5e" fill="url(#gRzp)" strokeWidth={2} />
                  <Area type="monotone" dataKey="EduraPay" stroke="#10b981" fill="url(#gEdura)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Split · 1 year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={splitPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {splitPie.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid oklch(0.922 0 0)',
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(v: number, name: string) => [formatInr(v), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm">
              {splitPie.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-semibold tabular-nums">{formatInr(s.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Multi-year — platform totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Year</th>
                  <th className="pb-2 pr-4 text-right">College (cumulative)</th>
                  <th className="pb-2 pr-4 text-right">Razorpay (cumulative)</th>
                  <th className="pb-2 pr-4 text-right">EduraPay (cumulative)</th>
                </tr>
              </thead>
              <tbody>
                {multiYear.map((row) => (
                  <tr key={row.year} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-4 font-semibold">{row.year}</td>
                    <td className="py-2 pr-4 text-right tabular-nums text-violet-700">{formatInr(row.College)}</td>
                    <td className="py-2 pr-4 text-right tabular-nums text-rose-600">{formatInr(row.Razorpay)}</td>
                    <td className={`py-2 pr-4 text-right tabular-nums ${row.EduraPay >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatInr(row.EduraPay)}
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
          <CardTitle className="text-base">Markup sensitivity</CardTitle>
          <p className="text-xs text-muted-foreground">
            How EduraPay net changes if you raise/lower the markup. MDR stays at {mdrPct}%.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensitivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" vertical={false} />
                <XAxis dataKey="markup" stroke="#9ca3af" fontSize={11} />
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
                <Bar dataKey="platformYear" radius={[8, 8, 0, 0]}>
                  {sensitivity.map((row, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        row.markupVal === markupPct
                          ? '#7c3aed'
                          : row.perStudent < 0
                            ? '#f43f5e'
                            : '#a78bfa'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Markup</th>
                  <th className="pb-2 pr-4 text-right">Per student</th>
                  <th className="pb-2 pr-4 text-right">Per institute / yr</th>
                  <th className="pb-2 pr-4 text-right">Platform total / yr</th>
                </tr>
              </thead>
              <tbody>
                {sensitivity.map((row) => (
                  <tr
                    key={row.markup}
                    className={`border-b border-border/60 last:border-0 ${row.markupVal === markupPct ? 'bg-violet-50/60 dark:bg-violet-950/20' : ''}`}
                  >
                    <td className="py-2 pr-4 font-semibold">
                      {row.markup}
                      {row.markupVal === markupPct && (
                        <span className="ml-2 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          current
                        </span>
                      )}
                    </td>
                    <td className={`py-2 pr-4 text-right tabular-nums ${row.perStudent >= 0 ? '' : 'text-rose-600'}`}>
                      {formatPlain(row.perStudent)}
                    </td>
                    <td className={`py-2 pr-4 text-right tabular-nums ${row.perInstYear >= 0 ? '' : 'text-rose-600'}`}>
                      {formatPlain(row.perInstYear)}
                    </td>
                    <td className={`py-2 pr-4 text-right tabular-nums font-semibold ${row.platformYear >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {formatInr(row.platformYear)}
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
          <CardTitle className="text-base">Scale snapshots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Institutes</th>
                  <th className="pb-2 pr-4 text-right">College pool / yr</th>
                  <th className="pb-2 pr-4 text-right">Razorpay take / yr</th>
                  <th className="pb-2 pr-4 text-right">EduraPay net / yr</th>
                </tr>
              </thead>
              <tbody>
                {[1, 10, 25, 50, 100, 250].map((n) => {
                  const c = calc.perInstYear.college * n
                  const r = calc.perInstYear.mdr * n
                  const e = calc.perInstYear.edura * n
                  return (
                    <tr
                      key={n}
                      className={`border-b border-border/60 last:border-0 ${n === inst ? 'bg-violet-50/60 dark:bg-violet-950/20' : ''}`}
                    >
                      <td className="py-2 pr-4 font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {n}
                        </span>
                        {n === inst && (
                          <span className="ml-2 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                            current
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums text-violet-700">{formatInr(c)}</td>
                      <td className="py-2 pr-4 text-right tabular-nums text-rose-600">{formatInr(r)}</td>
                      <td className={`py-2 pr-4 text-right tabular-nums font-semibold ${e >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {formatInr(e)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
