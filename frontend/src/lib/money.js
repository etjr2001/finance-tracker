const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'SGD',
})

export function formatMoney(amount) {
    return formatter.format(Number(amount))
}
