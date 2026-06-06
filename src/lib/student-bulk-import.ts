import * as XLSX from 'xlsx'

export type BulkImportField = {
  key: string
  label: string
  group: string
  required: boolean
  bulk_csv: boolean
  note?: string
}

export type BulkImportDocument = {
  key: string
  label: string
  required: boolean
  note?: string | null
}

export type BulkImportCourse = {
  id: string
  name: string
  grade?: string
}

export type BulkImportSchema = {
  fields: BulkImportField[]
  csv_headers: string[]
  documents: BulkImportDocument[]
  courses: BulkImportCourse[]
  default_academic_year: string
  csv_template_row: Record<string, string>
}

export type BulkImportRow = Record<string, string>

const HEADER_ALIASES: Record<string, string> = {
  email: 'primary_email',
  'email id': 'primary_email',
  email_id: 'primary_email',
  phone: 'primary_phone',
  mobile: 'primary_phone',
  phone_number: 'primary_phone',
  'phone number': 'primary_phone',
  'first name': 'first_name',
  firstname: 'first_name',
  'last name': 'last_name',
  lastname: 'last_name',
  'roll number': 'roll_no',
  rollnumber: 'roll_no',
  'class / courses': 'course_names',
  courses: 'course_names',
  class: 'course_names',
  'guardian name': 'guardian_name',
  guardian: 'guardian_name',
  'guardian phone': 'guardian_phone',
  'guardian relation': 'guardian_relation',
  'guardian email': 'guardian_email',
  address: 'address_line1',
  street: 'address_line1',
  'street address': 'address_line1',
  city: 'address_city',
  state: 'address_state',
  pincode: 'address_pincode',
  zip: 'address_pincode',
  'date of birth': 'dob',
  dob: 'dob',
  'academic year': 'academic_year',
  'admission year': 'admission_year',
}

function normHeader(h: string): string {
  const key = h.toLowerCase().trim().replace(/\s+/g, ' ')
  return HEADER_ALIASES[key] ?? key.replace(/\s+/g, '_')
}

/** Parse a single CSV line respecting quoted fields. */
function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur.trim())
  return out
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function rowsToCsv(headers: string[], rows: BulkImportRow[]): string {
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvCell(row[h] ?? '')).join(','))
  }
  return lines.join('\n')
}

export function buildTemplateCsv(schema: BulkImportSchema): string {
  const headers = schema.csv_headers
  const row = schema.csv_template_row
  return rowsToCsv(headers, [headers.reduce<BulkImportRow>((acc, h) => {
    acc[h] = row[h] ?? ''
    return acc
  }, {})])
}

function templateSampleRow(schema: BulkImportSchema): BulkImportRow {
  return schema.csv_headers.reduce<BulkImportRow>((acc, h) => {
    acc[h] = schema.csv_template_row[h] ?? ''
    return acc
  }, {})
}

/** Download a ready-to-fill .xlsx template (import directly via Choose file). */
export function downloadTemplateXlsx(schema: BulkImportSchema, filename = 'edurapay-students-import.xlsx'): void {
  const headers = schema.csv_headers
  const sample = templateSampleRow(schema)
  const blankRow = headers.map(() => '')

  const dataRows: string[][] = [
    headers.map((h) => sample[h] ?? ''),
    ...Array.from({ length: 4 }, () => [...blankRow]),
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(14, Math.min(28, h.length + 4)) }))
  ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' }

  const labelByKey = new Map(schema.fields.map((f) => [f.key, f.label]))
  const instructionLines: string[][] = [
    ['EduraPay — Bulk student import'],
    [''],
    ['How to use'],
    ['1. Fill student rows on the "Students" sheet (do not rename column headers).'],
    ['2. Save the file and import it using "Import Excel / CSV" in the bulk import dialog.'],
    ['3. ID documents are not in this file — collect via onboarding link after import.'],
    [''],
    ['Column guide'],
    ...schema.fields
      .filter((f) => f.bulk_csv)
      .map((f) => [f.key, labelByKey.get(f.key) ?? f.label, f.required ? 'Required' : 'Optional', f.note ?? '']),
    [''],
    ...(schema.courses.length > 0
      ? [['Available classes (use in course_names)', schema.courses.map((c) => c.name).join(' | ')]]
      : []),
    ...(schema.documents.length > 0
      ? [
          [''],
          ['Documents (collect separately)'],
          ...schema.documents.map((d) => [d.label, d.note ?? '']),
        ]
      : []),
  ]

  const wsInfo = XLSX.utils.aoa_to_sheet(instructionLines)
  wsInfo['!cols'] = [{ wch: 22 }, { wch: 24 }, { wch: 12 }, { wch: 48 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Students')
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Instructions')
  XLSX.writeFile(wb, filename)
}

export function parseBulkCsv(text: string, headers?: string[]): BulkImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return []

  const firstParts = parseCsvLine(lines[0])
  const firstNorm = firstParts.map(normHeader)
  const known = new Set((headers ?? firstNorm).map(normHeader))
  const hasHeader = firstNorm.some((h) => known.has(h))
  const csvHeaders = hasHeader ? firstNorm : (headers ?? firstNorm)
  const start = hasHeader ? 1 : 0

  return lines.slice(start).map((line) => {
    const parts = parseCsvLine(line)
    const row: BulkImportRow = {}
    if (!hasHeader && headers) {
      headers.forEach((h, i) => {
        row[h] = parts[i] ?? ''
      })
    } else {
      csvHeaders.forEach((h, i) => {
        row[h] = parts[i] ?? ''
      })
    }
    return row
  })
}

export async function parseBulkSpreadsheet(file: File, headers: string[]): Promise<BulkImportRow[]> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheetName = wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

  const pick = (row: Record<string, unknown>, key: string) => {
    for (const k of Object.keys(row)) {
      if (normHeader(k) === key) return String(row[k] ?? '').trim()
    }
    return ''
  }

  return json.map((row) => {
    const out: BulkImportRow = {}
    for (const h of headers) {
      out[h] = pick(row, h)
    }
    return out
  })
}

export function rowsToImportPayload(rows: BulkImportRow[]): Array<Record<string, unknown>> {
  return rows
    .filter((r) => (r.first_name ?? '').trim() !== '')
    .map((r) => {
      const payload: Record<string, unknown> = { status: 'active' }
      for (const [k, v] of Object.entries(r)) {
        const trimmed = v.trim()
        if (trimmed !== '') payload[k] = trimmed
      }
      return payload
    })
}

export const PREVIEW_COLUMNS = [
  { key: 'first_name', label: 'First' },
  { key: 'last_name', label: 'Last' },
  { key: 'primary_email', label: 'Email' },
  { key: 'primary_phone', label: 'Phone' },
  { key: 'course_names', label: 'Class' },
  { key: 'guardian_name', label: 'Guardian' },
] as const

export function previewCell(row: BulkImportRow, key: string): string {
  if (key === 'primary_email') return row.primary_email || row.email || ''
  if (key === 'primary_phone') return row.primary_phone || row.phone || ''
  return row[key] ?? ''
}

export function documentPendingLabel(documents: BulkImportDocument[]): string {
  if (documents.length === 0) return '—'
  return documents.map((d) => d.label).join(', ')
}
