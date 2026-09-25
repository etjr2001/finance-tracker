// Fixed locale so every browser renders SGD the same way ("$4,200.00"),
// rather than following the browser's language setting ("SGD 4,200.00"
// under en-US).
const formatter = new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
})

// ADR0010: signed amounts use U+2212, not Intl's hyphen-minus.
export const MINUS_SIGN = '\u2212'

// `|| 0` turns -0 (and NaN) into 0 so it never renders as "−$0.00".
export function formatMoney(amount) {
    return formatter.format(Number(amount) || 0).replace('-', MINUS_SIGN)
}
