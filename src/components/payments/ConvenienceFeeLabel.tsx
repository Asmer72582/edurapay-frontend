import { HelpCircle } from 'lucide-react'
import {
  CONVENIENCE_DEVELOPMENT_FEE_LABEL,
  CONVENIENCE_DEVELOPMENT_FEE_TOOLTIP,
} from '@/lib/payment-fee-disclosure'

export function ConvenienceFeeLabel() {
  return (
    <span className="inline-flex min-w-0 items-center gap-1 text-muted-foreground">
      <span className="truncate">{CONVENIENCE_DEVELOPMENT_FEE_LABEL}</span>
      <button
        type="button"
        className="group/help relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground/75 transition-colors hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        aria-label="Why is the Digital Payment & Service Fee charged?"
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden />
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-30 hidden w-[min(17rem,calc(100vw-3rem))] -translate-x-1/2 rounded-lg border border-border/70 bg-white px-3 py-2.5 text-left text-[11px] font-normal normal-case leading-snug tracking-normal text-slate-600 shadow-lg group-hover/help:block group-focus-visible/help:block dark:bg-card dark:text-muted-foreground"
        >
          {CONVENIENCE_DEVELOPMENT_FEE_TOOLTIP}
          <span
            className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-white dark:border-t-card"
            aria-hidden
          />
        </span>
      </button>
    </span>
  )
}
