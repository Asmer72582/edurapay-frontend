const TICKER_ITEMS = [
  '₹50Cr+ fees processed',
  '500+ institutes',
  '1M+ reminders sent',
  'Razorpay · UPI · Cards',
  'WhatsApp · SMS · Email',
  'Real-time reconciliation',
  'GST-ready receipts',
  'Multi-branch support',
  'Guardian portal',
  'Zero manual chasing',
]

export function MarqueeTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="motion-marquee-wrap relative overflow-hidden border-y border-violet-200/60 bg-white/70 py-3 backdrop-blur-md">
      <div className="motion-marquee-track flex w-max gap-10">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex shrink-0 items-center gap-3 text-sm font-semibold tracking-wide text-slate-600"
          >
            <span className="motion-pulse-dot h-1.5 w-1.5 rounded-full bg-violet-500" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
