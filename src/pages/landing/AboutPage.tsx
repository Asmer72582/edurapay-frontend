import type { ReactNode } from 'react'
import {
  Activity,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock,
  CreditCard,
  Layers,
  LineChart,
  Receipt,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react'
import { MarqueeTicker } from '@/components/landing/motion/MarqueeTicker'
import { MotionFeatureCard } from '@/components/landing/motion/MotionFeatureCard'
import { MotionPageCta } from '@/components/landing/motion/MotionPageCta'
import { MotionPageHero } from '@/components/landing/motion/MotionPageHero'
import { MotionPageLayout } from '@/components/landing/motion/MotionPageLayout'
import { MotionSection } from '@/components/landing/motion/MotionSection'
import { MotionReveal, MotionStaggerGrid } from '@/components/landing/motion/MotionStaggerGrid'
import { LegalEntityLink } from '@/components/landing/LegalEntityLink'
import { LegalEntityNotice } from '@/components/landing/LegalEntityNotice'

const whatWeDo = [
  {
    title: 'Digital Fee Collection',
    description:
      'Allow students and parents to pay fees securely through multiple payment methods including UPI, Cards, Net Banking, and Digital Wallets.',
    icon: CreditCard,
  },
  {
    title: 'Automated Payment Reminders',
    description:
      'Reduce payment delays with automatic reminders and notifications sent to students and parents before due dates.',
    icon: Bell,
  },
  {
    title: 'Real-Time Payment Tracking',
    description:
      'Track every transaction instantly with a centralized dashboard that provides complete visibility into collections.',
    icon: Activity,
  },
  {
    title: 'Student Management',
    description:
      'Maintain organized student records, fee structures, payment history, and account status from a single platform.',
    icon: Users,
  },
  {
    title: 'Financial Reports & Analytics',
    description:
      'Generate detailed reports and gain valuable insights into revenue, pending fees, collection trends, and financial performance.',
    icon: BarChart3,
  },
  {
    title: 'Receipt Generation',
    description:
      'Automatically generate digital receipts for every successful payment, reducing paperwork and manual effort.',
    icon: Receipt,
  },
  {
    title: 'Secure Payment Processing',
    description:
      'Ensure safe and reliable transactions through trusted payment gateway integrations and industry-standard security practices.',
    icon: ShieldCheck,
  },
]

const whyChoose = [
  {
    title: 'Save Administrative Time',
    description: 'Automate repetitive tasks and eliminate hours spent on manual fee tracking and follow-ups.',
    icon: Clock,
  },
  {
    title: 'Improve Collection Efficiency',
    description: 'Increase on-time payments through automated reminders and simplified payment processes.',
    icon: TrendingUp,
  },
  {
    title: 'Enhance Parent Experience',
    description: 'Provide parents with a convenient and secure way to manage fee payments anytime and anywhere.',
    icon: Smartphone,
  },
  {
    title: 'Eliminate Manual Errors',
    description: 'Reduce mistakes caused by manual entries, paperwork, and disconnected systems.',
    icon: CheckCircle2,
  },
  {
    title: 'Access Actionable Insights',
    description: 'Make informed decisions using real-time dashboards and detailed financial analytics.',
    icon: LineChart,
  },
  {
    title: 'Scale with Confidence',
    description: 'Whether you manage a small academy or a large educational institution, EduRaPay grows with your needs.',
    icon: Layers,
  },
]

const institutionTypes = [
  'Schools',
  'Colleges',
  'Coaching Classes',
  'Training Institutes',
  'Skill Development Centers',
  'Tuition Academies',
  'Educational Trusts',
  'Professional Learning Centers',
]

const visionPoints = [
  'Fee collections are effortless.',
  'Payments are transparent and secure.',
  'Administrative tasks are automated.',
  'Students and parents enjoy a frictionless payment experience.',
  'Institutions can focus more on education and less on paperwork.',
]

function ProseBlock({ children }: { children: ReactNode }) {
  return <div className="space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">{children}</div>
}

export function AboutPage() {
  return (
    <MotionPageLayout>
      <MotionPageHero
        eyebrow="About EduRaPay"
        title="Transforming Educational Fee Management for the Digital Era"
        description={
          <>
            EduRaPay is operated by <LegalEntityLink /> — a comprehensive fee collection and institute management
            platform for educational institutions.
          </>
        }
      />

      <MarqueeTicker />

      <MotionSection className="pt-0">
        <MotionReveal className="mx-auto max-w-3xl">
          <LegalEntityNotice className="rounded-2xl border border-violet-100 bg-violet-50/60 p-6" />
        </MotionReveal>
      </MotionSection>

      <MotionSection>
        <MotionReveal className="mx-auto max-w-3xl">
          <ProseBlock>
            <p>
              Educational institutions are the foundation of every successful society, yet many schools, colleges,
              coaching centers, academies, and training institutes still struggle with outdated fee collection methods,
              manual record keeping, delayed payments, and administrative inefficiencies. Managing student fees through
              spreadsheets, paper receipts, phone calls, and manual follow-ups consumes valuable time and resources
              that could otherwise be dedicated to education.
            </p>
            <p className="font-medium text-slate-900">EduRaPay was created to solve this challenge.</p>
            <p>
              EduRaPay empowers administrators to automate fee management, streamline collections, track payments in
              real-time, and provide a seamless digital payment experience for students and parents. The platform is
              operated by <LegalEntityLink variant="inherit" className="text-violet-700" />, which provides all payment
              processing and merchant services on EduRaPay.
            </p>
            <p>
              By combining technology, automation, and simplicity, EduRaPay helps institutions improve operational
              efficiency, increase collection rates, and eliminate the complexities of traditional fee management.
            </p>
          </ProseBlock>
        </MotionReveal>
      </MotionSection>

      <MotionSection variant="band">
        <div className="grid gap-8 lg:grid-cols-2">
          <MotionReveal from="left" className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
            <ProseBlock>
              <p className="mt-4">
                Our mission is to simplify and modernize educational fee management through innovative digital solutions
                that save time, reduce administrative burden, and create a transparent financial ecosystem for
                institutions, students, and parents.
              </p>
              <p>
                We aim to help every educational institution, regardless of its size, adopt digital-first operations
                without complexity or expensive infrastructure.
              </p>
            </ProseBlock>
          </MotionReveal>

          <MotionReveal from="right" className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Our Vision</h2>
            <ProseBlock>
              <p className="mt-4">
                We envision a future where educational institutions can manage their entire financial ecosystem from a
                single platform.
              </p>
              <p className="font-medium text-slate-800">A future where:</p>
            </ProseBlock>
            <ul className="mt-3 space-y-2">
              {visionPoints.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Our goal is to become a trusted technology partner for educational institutions across India and beyond.
            </p>
          </MotionReveal>
        </div>
      </MotionSection>

      <MotionSection eyebrow="Platform" title="What We Do" centerTitle subtitle="An all-in-one platform that simplifies the entire fee collection lifecycle.">
        <MotionStaggerGrid className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whatWeDo.map((item) => (
            <MotionFeatureCard key={item.title} title={item.title} description={item.description} icon={item.icon} />
          ))}
        </MotionStaggerGrid>
      </MotionSection>

      <MotionSection variant="band" eyebrow="Benefits" title="Why Institutions Choose EduRaPay" centerTitle>
        <MotionStaggerGrid className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whyChoose.map((item) => (
            <MotionFeatureCard key={item.title} title={item.title} description={item.description} icon={item.icon} />
          ))}
        </MotionStaggerGrid>
      </MotionSection>

      <MotionSection eyebrow="Who we serve" title="Built for Every Educational Institution" centerTitle>
        <MotionReveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            EduRaPay is designed to serve institutions of every size. No matter how large or small your organization,
            we provide the tools needed to simplify fee management and improve operational efficiency.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {institutionTypes.map((type) => (
              <span
                key={type}
                className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-800"
              >
                {type}
              </span>
            ))}
          </div>
        </MotionReveal>
      </MotionSection>

      <MotionSection variant="band">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
          <MotionReveal from="left">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-100 lg:mx-0">
              <ShieldCheck className="h-10 w-10 text-violet-600" />
            </div>
          </MotionReveal>
          <MotionReveal from="right">
            <h2 className="text-xl font-bold text-slate-900">Security & Reliability</h2>
            <ProseBlock>
              <p className="mt-4">
                We understand that financial data is critical. That is why EduRaPay is built with security, reliability,
                and transparency at its core. Every transaction is processed through secure payment infrastructure,
                ensuring that institutions and parents can trust the platform with confidence.
              </p>
              <p>
                Our commitment is to provide a safe, stable, and dependable environment for educational financial
                operations.
              </p>
            </ProseBlock>
          </MotionReveal>
        </div>
      </MotionSection>

      <MotionSection>
        <MotionReveal className="mx-auto max-w-3xl rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-sm sm:p-10">
          <h2 className="text-xl font-bold text-slate-900">Our Commitment</h2>
          <ProseBlock>
            <p className="mt-4">
              At EduRaPay, we are more than a software platform. We are a partner in your institution&apos;s digital
              transformation journey.
            </p>
            <p>
              We continuously innovate, listen to feedback, and build solutions that address real-world challenges faced
              by educational institutions. Our focus remains on creating technology that is simple to use, powerful in
              functionality, and impactful in results.
            </p>
            <p className="font-medium text-slate-800">
              Together, we can create a smarter, more efficient future for educational administration.
            </p>
          </ProseBlock>
        </MotionReveal>
      </MotionSection>

      <MotionPageCta
        title="Simplifying Fee Collection. Empowering Education."
        subtitle="Helping institutions save time, improve collections, and deliver a better experience for students and parents through modern digital payment solutions."
      />
    </MotionPageLayout>
  )
}
