// Approximates java.math.RoundingMode.HALF_EVEN ("banker's rounding") to 2
// decimal places, for the demo dashboard's client-side reimplementation of
// DashboardService's aggregation math. It is not a general-purpose decimal
// library and will not exactly match BigDecimal for pathological inputs
// (e.g. results of chained divisions) — acceptable here because every demo
// amount is either seed data or user input already bounded to 2 decimal
// places by TransactionForm's numeric(12,2) guard. See ADR0009.
export function roundHalfEven(value) {
    const scaled = value * 100
    const floor = Math.floor(scaled)
    const diff = scaled - floor
    const EPS = 1e-9 // guards against binary float representation error before comparing to 0.5

    let rounded
    if (Math.abs(diff - 0.5) < EPS) {
        rounded = floor % 2 === 0 ? floor : floor + 1
    } else {
        rounded = Math.round(scaled)
    }

    return Math.round(rounded) / 100
}
