import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { api, apiGet } from '@/lib/api'
import type { ApiEnvelope } from '@/types/api'
import { cn } from '@/lib/utils'

type OnboardingCourse = {
  id: string
  name: string
  grade?: string
}

type OnboardingMetaPayload = {
  courses?: Array<{ id?: string; _id?: string; name: string; grade?: string }>
  grades?: string[]
  default_academic_year?: string
}

function normalizeCourse(raw: { id?: string; _id?: string; name: string; grade?: string }): OnboardingCourse {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    name: raw.name,
    grade: raw.grade,
  }
}

function defaultAcademicYear() {
  const y = new Date().getFullYear()
  return `${y}-${y + 1}`
}

function emptyForm(academicYear = defaultAcademicYear()) {
  return {
    first_name: '',
    last_name: '',
    roll_no: '',
    primary_email: '',
    secondary_email: '',
    primary_phone: '',
    secondary_phone: '',
    academic_year: academicYear,
    admission_year: String(new Date().getFullYear()),
    dob: '',
    course_ids: [] as string[],
    guardian_name: '',
    guardian_phone: '',
    guardian_relation: '',
    guardian_email: '',
    address_line1: '',
    address_city: '',
    address_state: '',
    address_pincode: '',
    id_document: null as File | null,
  }
}

export function StudentOnboardingPage() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [valid, setValid] = useState(false)
  const [courses, setCourses] = useState<OnboardingCourse[]>([])
  const [form, setForm] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)

  const safeToken = useMemo(() => token ?? '', [token])
  const coursesById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      try {
        const res = await apiGet<OnboardingMetaPayload>(`/v1/public/student-onboarding/${safeToken}`)
        const payload = (res as ApiEnvelope<OnboardingMetaPayload>).data
        if (!payload) {
          throw new Error('Invalid onboarding response')
        }
        if (mounted) {
          setValid(true)
          setCourses((payload.courses ?? []).map(normalizeCourse).filter((c) => c.id !== ''))
          setForm(emptyForm(payload.default_academic_year ?? defaultAcademicYear()))
        }
      } catch {
        if (mounted) setValid(false)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (safeToken) run()
    return () => {
      mounted = false
    }
  }, [safeToken])

  const toggleCourse = (courseId: string) => {
    setForm((prev) => {
      const selected = prev.course_ids.includes(courseId)
      return {
        ...prev,
        course_ids: selected
          ? prev.course_ids.filter((id) => id !== courseId)
          : [...prev.course_ids, courseId],
      }
    })
  }

  const submit = async () => {
    if (!safeToken) return
    setSubmitting(true)
    try {
      const body = new FormData()
      body.append('first_name', form.first_name)
      if (form.last_name) body.append('last_name', form.last_name)
      if (form.roll_no) body.append('roll_no', form.roll_no)
      if (form.primary_email) body.append('primary_email', form.primary_email)
      if (form.secondary_email) body.append('secondary_email', form.secondary_email)
      if (form.primary_phone) body.append('primary_phone', form.primary_phone)
      if (form.secondary_phone) body.append('secondary_phone', form.secondary_phone)
      form.course_ids.forEach((id) => body.append('course_ids[]', id))
      if (form.academic_year) body.append('academic_year', form.academic_year)
      if (form.admission_year) body.append('admission_year', form.admission_year)
      if (form.dob) body.append('dob', form.dob)
      if (form.guardian_name) body.append('guardian[name]', form.guardian_name)
      if (form.guardian_phone) body.append('guardian[phone]', form.guardian_phone)
      if (form.guardian_relation) body.append('guardian[relation]', form.guardian_relation)
      if (form.guardian_email) body.append('guardian[email]', form.guardian_email)
      if (form.address_line1) body.append('address[line1]', form.address_line1)
      if (form.address_city) body.append('address[city]', form.address_city)
      if (form.address_state) body.append('address[state]', form.address_state)
      if (form.address_pincode) body.append('address[pincode]', form.address_pincode)
      if (form.id_document) body.append('id_document', form.id_document)

      await api.post(`/v1/public/student-onboarding/${safeToken}`, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Submitted successfully!')
      setForm(emptyForm(form.academic_year))
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message ?? 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading form…</div>
  }

  if (!valid) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Invalid link</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This onboarding link is invalid or expired. Please contact your institute admin for a new link.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
          E
        </div>
        <h1 className="text-2xl font-bold">Student onboarding</h1>
        <p className="text-sm text-muted-foreground">Fill your details to register with your institute.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First name</Label>
              <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Last name</Label>
              <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Roll number</Label>
              <Input value={form.roll_no} onChange={(e) => setForm({ ...form, roll_no: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Date of birth</Label>
              <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary email</Label>
              <Input
                type="email"
                value={form.primary_email}
                onChange={(e) => setForm({ ...form, primary_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary email</Label>
              <Input
                type="email"
                value={form.secondary_email}
                onChange={(e) => setForm({ ...form, secondary_email: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary phone</Label>
              <Input value={form.primary_phone} onChange={(e) => setForm({ ...form, primary_phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Secondary phone</Label>
              <Input
                value={form.secondary_phone}
                onChange={(e) => setForm({ ...form, secondary_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Class / Course</Label>
            <p className="text-xs text-muted-foreground">
              Select your class or course (you can choose more than one). Fees apply from the institute fee plan after
              enrollment.
            </p>
            <div className="rounded-xl border border-border/60 p-3">
              {form.course_ids.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {form.course_ids.map((courseId) => {
                    const course = coursesById.get(courseId)
                    if (!course) return null
                    return (
                      <span
                        key={courseId}
                        className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700"
                      >
                        {course.name}
                        <button
                          type="button"
                          className="rounded p-0.5 hover:bg-violet-100"
                          aria-label={`Remove ${course.name}`}
                          onClick={() => toggleCourse(courseId)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No classes are listed yet. You can still submit — the institute will assign your class later.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {courses.map((course) => {
                    const selected = form.course_ids.includes(course.id)
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => toggleCourse(course.id)}
                        className={cn(
                          'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                          selected
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                            : 'border-border/60 bg-muted/20 text-foreground hover:bg-muted/40',
                        )}
                      >
                        {course.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-4">
            <div className="text-sm font-semibold">Guardian / parent</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Relation</Label>
                <Input
                  value={form.guardian_relation}
                  onChange={(e) => setForm({ ...form, guardian_relation: e.target.value })}
                  placeholder="Mother, Father…"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.guardian_phone} onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.guardian_email}
                  onChange={(e) => setForm({ ...form, guardian_email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-4">
            <div className="text-sm font-semibold">Address</div>
            <div className="space-y-2">
              <Label>Street</Label>
              <Input value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.address_city} onChange={(e) => setForm({ ...form, address_city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={form.address_state} onChange={(e) => setForm({ ...form, address_state: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input value={form.address_pincode} onChange={(e) => setForm({ ...form, address_pincode: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>ID document (optional)</Label>
            <p className="text-xs text-muted-foreground">PDF or image, max 5 MB — for institute verification.</p>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setForm({ ...form, id_document: e.target.files?.[0] ?? null })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Academic year</Label>
              <Input
                value={form.academic_year}
                onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                placeholder="2026-2027"
              />
            </div>
            <div className="space-y-2">
              <Label>Admission year</Label>
              <Input
                value={form.admission_year}
                onChange={(e) => setForm({ ...form, admission_year: e.target.value })}
                placeholder="2026"
              />
            </div>
          </div>

          <Button
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
            onClick={submit}
            disabled={submitting || !form.first_name}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
