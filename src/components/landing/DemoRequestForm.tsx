import { useState } from 'react'
import { toast } from 'sonner'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { isEmailJsConfigured, sendContactEmail } from '@/lib/emailjs-contact'

type DemoRequestFormProps = {
  variant?: 'demo' | 'contact'
  className?: string
  compact?: boolean
}

export function DemoRequestForm({ variant = 'demo', className, compact = false }: DemoRequestFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    institute: '',
    message: '',
  })

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Please enter your name and email.')
      return
    }
    if (!form.message.trim() && variant === 'demo') {
      toast.error('Tell us briefly about your institute (students, city, current process).')
      return
    }
    if (!isEmailJsConfigured()) {
      toast.error('Email is not configured yet. Add EmailJS keys to your environment.')
      return
    }

    const isDemo = variant === 'demo'
    setSubmitting(true)
    try {
      await sendContactEmail({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        institute: form.institute.trim() || undefined,
        message: [
          form.institute.trim() ? `Institute: ${form.institute.trim()}` : null,
          form.message.trim() || (isDemo ? 'Requested a product demo via the website.' : ''),
        ]
          .filter(Boolean)
          .join('\n\n'),
        type: isDemo ? 'demo' : 'contact',
      })
      toast.success(isDemo ? 'Demo request sent! We will contact you within one business day.' : 'Message sent!')
      setForm({ name: '', email: '', phone: '', institute: '', message: '' })
    } catch {
      toast.error('Could not send your message. Please try again or email support@edurapay.com directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={className}>
      <div className={compact ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-4 sm:grid-cols-2'}>
        <div className="space-y-2">
          <Label htmlFor="demo-name">Name *</Label>
          <Input
            id="demo-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="demo-email">Work email *</Label>
          <Input
            id="demo-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@institute.edu"
            className="rounded-xl"
          />
        </div>
      </div>
      <div className={compact ? 'mt-3 grid gap-3 sm:grid-cols-2' : 'mt-4 grid gap-4 sm:grid-cols-2'}>
        <div className="space-y-2">
          <Label htmlFor="demo-phone">Phone</Label>
          <Input
            id="demo-phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91..."
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="demo-institute">Institute name</Label>
          <Input
            id="demo-institute"
            value={form.institute}
            onChange={(e) => setForm({ ...form, institute: e.target.value })}
            placeholder="Springfield Academy"
            className="rounded-xl"
          />
        </div>
      </div>
      <div className={compact ? 'mt-3 space-y-2' : 'mt-4 space-y-2'}>
        <Label htmlFor="demo-message">{variant === 'demo' ? 'Tell us about your needs *' : 'Message'}</Label>
        <Textarea
          id="demo-message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Student count, fee collection challenges, cities you operate in..."
          className={compact ? 'min-h-[72px] resize-none rounded-xl' : 'min-h-[120px] rounded-xl'}
        />
      </div>
      <Button
        onClick={submit}
        disabled={submitting}
        className={compact ? 'mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 sm:w-auto' : 'mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 sm:w-auto'}
        size="lg"
      >
        {submitting ? 'Sending…' : variant === 'demo' ? 'Request demo' : 'Send message'}
      </Button>
    </div>
  )
}
