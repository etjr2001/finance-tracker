import { formatMoney } from '@utils/money'

export function Money({ amount, className = '' }) {
    return <span className={`tabular ${className}`}>{formatMoney(amount)}</span>
}
