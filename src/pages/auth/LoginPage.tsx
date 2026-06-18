import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Mail, Smartphone } from 'lucide-react'
import { useAuthStore, getDashboardPath } from '@/stores/auth'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const [step, setStep] = useState<'identifier' | 'otp'>('identifier')
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [maskedDestination, setMaskedDestination] = useState('')
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email')
  const [resendIn, setResendIn] = useState(0)

  const requestOtp = useAuthStore((s) => s.requestOtp)
  const verifyOtp = useAuthStore((s) => s.verifyOtp)
  const isLoading = useAuthStore((s) => s.isLoading)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate(getDashboardPath(user.role), { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  const sendOtp = async () => {
    try {
      const res = await requestOtp(identifier.trim())
      setMaskedDestination(res.destination_masked)
      setChannel(res.channel)
      setResendIn(res.resend_after)
      setStep('otp')
      if (res.debug_otp) {
        toast.message(`Dev OTP: ${res.debug_otp}`, { duration: 12000 })
      } else {
        toast.success(`Code sent to ${res.destination_masked}`)
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message ?? 'Could not send OTP.')
    }
  }

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await verifyOtp(identifier.trim(), code.trim())
      const loggedIn = useAuthStore.getState().user
      toast.success('Welcome back!')
      navigate(getDashboardPath(loggedIn?.role))
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message ?? 'Invalid or expired code.')
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex justify-center">
          <BrandLogo variant="full" size="md" className="max-w-[220px]" />
        </div>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-muted-foreground">OTP login — no password required</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{step === 'identifier' ? 'Enter email or phone' : 'Enter verification code'}</CardTitle>
          <CardDescription>
            {step === 'identifier'
              ? 'Institute, student, and guardian accounts use a one-time code every time you sign in.'
              : `We sent a 6-digit code to ${maskedDestination} via ${channel === 'email' ? 'email' : 'WhatsApp'}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'identifier' ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                sendOtp()
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or mobile number</Label>
                <Input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@school.edu or 9876543210"
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={isLoading || !identifier.trim()}>
                {isLoading ? 'Sending code…' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                  className="text-center text-lg tracking-[0.35em]"
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={isLoading || code.length < 4}>
                {isLoading ? 'Verifying…' : 'Verify & sign in'}
              </Button>
              <div className="flex items-center justify-between gap-2 text-sm">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setStep('identifier')
                    setCode('')
                  }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Change email/phone
                </button>
                <button
                  type="button"
                  className="font-medium text-violet-600 hover:underline disabled:opacity-50"
                  disabled={resendIn > 0 || isLoading}
                  onClick={sendOtp}
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="space-y-2 p-4 text-xs text-muted-foreground">
          <div className="font-semibold text-foreground">Demo logins (after seed)</div>
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            institute@springfield.edu · student@springfield.edu · guardian@springfield.edu
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-3.5 w-3.5" />
            Or mobile: 9123456789 (student) · 9988776655 (guardian)
          </div>
          <div>In local dev, the OTP also appears in the toast and in `storage/logs/laravel.log`.</div>
        </CardContent>
      </Card>
    </div>
  )
}
