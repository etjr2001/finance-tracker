import { Money } from '@components/Money'
import { MINUS_SIGN } from '@utils/money'
import { isIncome } from '@features/transactions/utils/transaction'

// "+$12.00" / "−$12.00" for a single Transaction. Income is always
// deposit-green; expenses default to ink in lists so they don't read as a
// wall of red (ADR0010). Hero figures pass expenseClass="text-withdrawal".
// Zero (a Draft) gets no sign, matching formatMoney and the day totals.
export function SignedAmount({ transaction, expenseClass = 'text-ink', className = '' }) {
    const isPositive = isIncome(transaction)
    const sign = Number(transaction.amount) === 0 ? '' : isPositive ? '+' : MINUS_SIGN

    return (
        <span className={`${isPositive ? 'text-deposit' : expenseClass} ${className}`}>
            {sign}
            <Money amount={transaction.amount} />
        </span>
    )
}
