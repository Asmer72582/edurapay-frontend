import { useState } from 'react'
import { Bell, Mail, MessageSquare, Play, RefreshCw, Settings, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InvoiceConfigureModal } from '@/components/invoices/InvoiceConfigureModal'
import {
  useFeeReminderLogs,
  useFeeReminderSettings,
  useFeeReminderStats,
  useRunFeeReminders,
} from '@/hooks/useApi'
import { cn } from '@/lib/utils'

export function NotificationsPage() {
  const [configureOpen, setConfigureOpen] = useState(false)
  const { data: statsData, refetch: refetchStats } = useFeeReminderStats()
  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useFeeReminderLogs(30)
  const { data: settingsData } = useFeeReminderSettings()
  const runReminders = useRunFeeReminders()

  const stats = statsData?.data
  const settings = settingsData?.data
  const logs = (logsData?.data?.data ?? []) as Record<string, unknown>[]

  const runNow = async () => {
    try {
      const res = await runReminders.mutateAsync({ sync: true })
      const payload = res.data as { sent?: number; failed?: number; skipped?: number }
      toast.success(
        res.message ??
          `Reminders processed: ${payload?.sent ?? 0} sent, ${payload?.failed ?? 0} failed`,
      )
      refetchStats()
      refetchLogs()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message ?? 'Could not run reminders')
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Engagement' }, { label: 'Notifications' }]}
        title="Fee reminders"
        description="Automated email, SMS, and WhatsApp reminders before, on, and after installment due dates."
        actions={
          <>
            <Button variant="outline" className="rounded-xl" onClick={() => setConfigureOpen(true)}>
              <Settings className="mr-1.5 h-4 w-4" />
              Configure
            </Button>
            <Button
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
              onClick={runNow}
              disabled={runReminders.isPending}
            >
              <Play className="mr-1.5 h-4 w-4" />
              {runReminders.isPending ? 'Running…' : 'Run due reminders now'}
            </Button>
          </>
        }
      />

      <div className="rounded-xl border border-violet-200/60 bg-violet-50/50 px-4 py-3 text-sm text-violet-900">
        <p className="font-medium">Daily schedule: 9:00 AM IST</p>
        <p className="mt-1 text-xs text-violet-800/90">
          Cadence:{' '}
          {Array.isArray(settings?.reminders?.cadence_days)
            ? (settings.reminders.cadence_days as number[]).join(', ')
            : '7, 3, 1, 0, -3'}{' '}
          (positive = days before due, 0 = due today, negative = days overdue). Drivers: SMS{' '}
          <span className="font-mono">{settings?.sms_driver ?? 'log'}</span>, WhatsApp{' '}
          <span className="font-mono">{settings?.whatsapp_driver ?? 'log'}</span>. In local dev, messages are
          written to <span className="font-mono">storage/logs/laravel.log</span>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Sent (30 days)" value={String(stats?.sent_30d ?? 0)} trend="Delivered" trendUp />
        <MetricCard
          label="Email"
          value={String(stats?.by_channel?.email ?? 0)}
          trend="Last 30 days"
          trendUp={(stats?.by_channel?.email ?? 0) > 0}
        />
        <MetricCard
          label="SMS"
          value={String(stats?.by_channel?.sms ?? 0)}
          trend={`Driver: ${settings?.sms_driver ?? 'log'}`}
          trendUp={false}
        />
        <MetricCard
          label="WhatsApp"
          value={String(stats?.by_channel?.whatsapp ?? 0)}
          trend={`Driver: ${settings?.whatsapp_driver ?? 'log'}`}
          trendUp={false}
        />
      </div>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Delivery log
          </CardTitle>
          <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => refetchLogs()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Channel</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Trigger</th>
                <th className="px-5 py-3">Preview</th>
              </tr>
            </thead>
            <tbody>
              {logsLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    No reminders sent yet. Run due reminders or wait for the daily schedule.
                  </td>
                </tr>
              ) : (
                logs.map((row, i) => {
                  const status = String(row.status ?? '')
                  const channel = String(row.channel ?? '')
                  return (
                    <tr key={String(row.id ?? row._id ?? i)} className="border-b border-border/40">
                      <td className="px-5 py-3 text-muted-foreground">
                        {row.sent_at ? new Date(String(row.sent_at)).toLocaleString('en-IN') : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 capitalize">
                          {channel === 'email' && <Mail className="h-3.5 w-3.5" />}
                          {channel === 'sms' && <Smartphone className="h-3.5 w-3.5" />}
                          {channel === 'whatsapp' && <MessageSquare className="h-3.5 w-3.5" />}
                          {channel}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge
                          status={status}
                          variant={statusVariant(status === 'sent' ? 'completed' : status)}
                        />
                      </td>
                      <td className="px-5 py-3 capitalize text-muted-foreground">{String(row.trigger ?? '')}</td>
                      <td className="max-w-xs truncate px-5 py-3 text-xs text-muted-foreground">
                        {String(row.message_preview ?? row.error ?? '')}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <InvoiceConfigureModal open={configureOpen} onClose={() => setConfigureOpen(false)} />
    </div>
  )
}
