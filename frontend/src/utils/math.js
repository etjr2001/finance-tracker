// Share of `part` in `whole` as 0–100. Returns 0 (not NaN/Infinity) when
// there is no whole to divide by.
export function percentOf(part, whole) {
    return whole ? (part / whole) * 100 : 0
}

export function sum(values) {
    return values.reduce((total, value) => total + value, 0)
}
