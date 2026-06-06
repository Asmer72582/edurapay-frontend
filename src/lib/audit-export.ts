import type { AuditReportPayload } from '@/types/audit'
import { formatInr } from '@/lib/institute-mock'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function tableFromObjects(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return '<p class="muted">No rows.</p>'
  }
  const headers = Object.keys(rows[0])
  const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')
  const body = rows
    .map(
      (row) =>
        `<tr>${headers.map((h) => `<td>${escapeHtml(String(row[h] ?? '—'))}</td>`).join('')}</tr>`,
    )
    .join('')
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}

export function exportAuditReportPdf(report: AuditReportPayload): void {
  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (!win) return

  const inst = report.institution
  const period = report.audit_period
  const generated = new Date(report.generated_at).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const sections = report.sections
  let bodyHtml = ''

  if (report.report_type === 'full_audit_pack') {
    const exec = (sections.executive_summary ?? {}) as Record<string, number>
    const metrics = (sections.financial_overview ?? {}) as Record<string, number>
    const findings = (sections.findings ?? []) as Record<string, unknown>[]
    const recommendations = (sections.recommendations ?? []) as string[]
    const compliance = (sections.compliance_status ?? {}) as {
      score?: number
      summary?: Record<string, number>
    }

    bodyHtml = `
      <h2>Executive summary</h2>
      <div class="summary">
        <div class="card"><strong>Collected (period)</strong><span>${escapeHtml(formatInr(exec.total_collected_inr ?? 0))}</span></div>
        <div class="card"><strong>Pending</strong><span>${escapeHtml(formatInr(exec.pending_inr ?? 0))}</span></div>
        <div class="card"><strong>Overdue</strong><span>${escapeHtml(formatInr(exec.overdue_inr ?? 0))}</span></div>
        <div class="card"><strong>Compliance score</strong><span>${compliance.score ?? 0}%</span></div>
        <div class="card"><strong>Findings</strong><span>${exec.findings_count ?? 0}</span></div>
      </div>
      <h2>Financial overview</h2>
      <div class="summary">
        <div class="card"><strong>Assigned</strong><span>${escapeHtml(formatInr(metrics.total_assigned_inr ?? 0))}</span></div>
        <div class="card"><strong>Scholarships</strong><span>${escapeHtml(formatInr(metrics.scholarships_concessions_inr ?? 0))}</span></div>
        <div class="card"><strong>Reconciled txns</strong><span>${metrics.reconciled_transactions ?? 0}</span></div>
        <div class="card"><strong>Unreconciled</strong><span>${metrics.unreconciled_transactions ?? 0}</span></div>
      </div>
      <h2>Compliance status</h2>
      <p>Score: <strong>${compliance.score ?? 0}%</strong> · High severity: ${compliance.summary?.high_severity ?? 0}</p>
      <h2>Findings</h2>
      ${tableFromObjects(findings.slice(0, 50))}
      <h2>Recommendations</h2>
      <ul>${recommendations.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
      <h2>Student-wise fees (sample)</h2>
      ${tableFromObjects((sections.student_wise_sample ?? []) as Record<string, unknown>[])}
      <h2>Class-wise collection</h2>
      ${tableFromObjects((sections.class_wise ?? []) as Record<string, unknown>[])}
    `
  } else if (sections.rows) {
    bodyHtml = tableFromObjects(sections.rows as Record<string, unknown>[])
  } else if (sections.metrics) {
    bodyHtml = tableFromObjects([sections.metrics as Record<string, unknown>])
  } else {
    bodyHtml = `<pre>${escapeHtml(JSON.stringify(sections, null, 2))}</pre>`
  }

  const notes = report.auditor_notes?.trim()
  const notesBlock = notes
    ? `<h2>Auditor notes</h2><p>${escapeHtml(notes)}</p>`
    : ''

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>EduraPay Audit Report — ${escapeHtml(report.report_type)}</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #111; padding: 24px; font-size: 12px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    h2 { font-size: 14px; margin: 24px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    .meta { color: #555; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
    th { background: #f4f4f5; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 10px; }
    .card strong { display: block; font-size: 11px; color: #666; text-transform: uppercase; }
    .card span { font-size: 16px; font-weight: 700; }
    .signature { margin-top: 48px; border-top: 1px solid #ccc; padding-top: 16px; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(inst.name)} — Audit report</h1>
  <div class="meta">
    Report: ${escapeHtml(report.report_type.replace(/_/g, ' '))}<br/>
    Period: ${escapeHtml(period.from)} to ${escapeHtml(period.to)}<br/>
    Generated ${escapeHtml(generated)}
  </div>
  ${bodyHtml}
  ${notesBlock}
  <div class="signature">
    <strong>${escapeHtml(report.digital_signature.label)}</strong><br/>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`

  win.document.open()
  win.document.write(html)
  win.document.close()
}
