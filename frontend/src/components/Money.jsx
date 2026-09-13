import { formatMoney } from '../lib/money'

export default function Money({ amount, className = '' }) {
    return <span className={`tabular ${className}`}>{formatMoney(amount)}</span>
}
