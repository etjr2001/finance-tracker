import { SegmentedControl } from '@components/SegmentedControl'
import { TRANSACTION_TYPES } from '@features/transactions/utils/transaction'

const OPTIONS = [
    { value: TRANSACTION_TYPES.EXPENSE, label: 'Expense' },
    { value: TRANSACTION_TYPES.INCOME, label: 'Income' },
]

// ink for Expense, deposit for Income, matching ADR0010's amount colours.
// Written out in full (not built from `value`) so Tailwind's build can find
// the classes — see Badge.jsx.
const FILL_CLASS = {
    [TRANSACTION_TYPES.EXPENSE]: 'bg-ink',
    [TRANSACTION_TYPES.INCOME]: 'bg-deposit',
}
const TEXT_CLASS = {
    [TRANSACTION_TYPES.EXPENSE]: 'text-ink',
    [TRANSACTION_TYPES.INCOME]: 'text-deposit',
}

export function TransactionTypeToggle({ value, onChange }) {
    return (
        <div className="md:col-span-2">
            <SegmentedControl
                options={OPTIONS}
                value={value}
                onChange={onChange}
                role="radiogroup"
                ariaLabel="Transaction type"
                fillClassName={FILL_CLASS[value]}
                selectedTextClassName={TEXT_CLASS[value]}
            />
        </div>
    )
}
