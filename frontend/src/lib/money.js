// Fixed locale so every browser renders SGD the same way ("$4,200.00"),
// rather than following the browser's language setting ("SGD 4,200.00"
// under en-US).
const formatter = new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
})

// Signed amounts use U+2212 (ADR0010), not Intl's hyphen-minus. `|| 0`
// turns -0 into 0 so it doesn't render as "−$0.00".
export function formatMoney(amount) {
    return formatter.format(Number(amount) || 0).replace('-', '−')
}
