import type { CollectionReportPayload } from '@/types/reports'
import { formatInr } from '@/lib/institute-mock'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function tableRows(
  headers: string[],
  rows: (string | number)[][],
): string {
  const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')
  const body = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join('')}</tr>`,
    )
    .join('')

  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}

export function exportCollectionReportPdf(
  report: CollectionReportPayload,
  instituteLabel: string,
): void {
  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (!win) {
    return
  }

  const s = report.summary
  const generated = new Date(report.generated_at).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const collectionRows = report.by_collection.map((r) => [
    r.course_name,
    r.academic_year || '—',
    formatInr(r.collected_inr),
    formatInr(r.pending_inr),
    formatInr(r.overdue_inr),
    formatInr(r.total_assigned_inr),
    r.student_count,
  ])

  const periodRows = report.by_period.map((r) => [
    r.period_label,
    formatInr(r.collected_inr),
    formatInr(r.pending_inr),
    formatInr(r.overdue_inr),
    formatInr(r.total_due_inr),
  ])

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>EduraPay Collection Report</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #111; padding: 24px; font-size: 12px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .meta { color: #555; margin-bottom: 20px; }
    h2 { font-size: 14px; margin: 24px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
    th { background: #f4f4f5; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 10px; }
    .card strong { display: block; font-size: 11px; color: #666; text-transform: uppercase; }
    .card span { font-size: 16px; font-weight: 700; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(instituteLabel)} — Fee collection report</h1>
  <div class="meta">
    Generated ${escapeHtml(generated)} · Period ${escapeHtml(report.filters.period)} (${escapeHtml(report.filters.from)} to ${escapeHtml(report.filters.to)})
  </div>
  <div class="summary">
    <div class="card"><strong>Collected</strong><span>${escapeHtml(formatInr(s.collected_inr, true))}</span></div>
    <div class="card"><strong>Pending</strong><span>${escapeHtml(formatInr(s.pending_inr, true))}</span></div>
    <div class="card"><strong>Overdue</strong><span>${escapeHtml(formatInr(s.overdue_inr, true))}</span></div>
    <div class="card"><strong>Collection rate</strong><span>${s.collection_rate_pct}%</span></div>
    <div class="card"><strong>Overdue ratio</strong><span>${s.overdue_ratio_pct}%</span></div>
    <div class="card"><strong>Students with fees</strong><span>${s.students_with_fees}</span></div>
  </div>
  <h2>Collection-wise</h2>
  ${tableRows(
    ['Collection', 'Academic year', 'Collected', 'Pending', 'Overdue', 'Total assigned', 'Students'],
    collectionRows.length ? collectionRows : [['—', '—', '—', '—', '—', '—', '0']],
  )}
  <h2>Period-wise</h2>
  ${tableRows(
    ['Period', 'Collected', 'Pending', 'Overdue', 'Total due'],
    periodRows.length ? periodRows : [['—', '—', '—', '—', '—']],
  )}
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`

  win.document.open()
  win.document.write(html)
  win.document.close()
}
