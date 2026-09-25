import { TRANSACTION_TYPES } from '@features/transactions/utils/transaction'

const TYPE_LABELS = {
    [TRANSACTION_TYPES.EXPENSE]: 'Expense',
    [TRANSACTION_TYPES.INCOME]: 'Income',
}

export function TransactionTypeRadios({ value, onChange }) {
    return (
        <div className="md:col-span-2 flex gap-4">
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
                <label key={type} className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="type" checked={value === type} onChange={() => onChange(type)} />
                    {label}
                </label>
            ))}
        </div>
    )
}
