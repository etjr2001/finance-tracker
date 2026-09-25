import { Money } from '@components/Money'

export function DayGroupHeader({ label, total }) {
    return (
        <div className="flex items-baseline justify-between mb-2 px-1">
            <span className="text-sm">
                {label.relative && (
                    <>
                        <span className="font-medium">{label.relative}</span>{' '}
                    </>
                )}
                <span className={label.relative ? 'text-ink-soft' : 'font-medium'}>{label.formatted}</span>
            </span>
            <span className="text-sm text-ink-soft tabular">
                <Money amount={total} />
            </span>
        </div>
    )
}
