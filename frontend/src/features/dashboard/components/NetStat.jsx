import { Money } from '@components/Money'
import { ProgressBar } from '@components/ProgressBar'

// One labelled sub-figure of the Net card (Income or Expenses) with its bar.
export function NetStat({ icon: Icon, iconClass, label, amount, barPercent, barClass, aside }) {
    return (
        <div>
            <div className="flex items-center gap-1 text-sm text-ink-soft mb-1">
                <Icon aria-hidden="true" strokeWidth={1.7} className={`h-3.5 w-3.5 ${iconClass}`} />
                {label}
            </div>
            <div className="flex items-baseline justify-between mb-1.5">
                <Money amount={amount} className="font-medium" />
                {aside && <span className="text-sm text-ink-soft tabular">{aside}</span>}
            </div>
            <ProgressBar percent={barPercent} fillClass={barClass} />
        </div>
    )
}
