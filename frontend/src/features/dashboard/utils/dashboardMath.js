import { percentOf, sum } from '@utils/math'

// Income vs. Expenses bar widths: whichever is larger is the 100% baseline
// and the other is scaled against it — so a month where expenses are
// several times income doesn't look the same as a month in the black.
export function incomeExpenseBarWidths(income, expenses) {
    const baseline = Math.max(income, expenses)
    return {
        incomeWidth: percentOf(income, baseline),
        expenseWidth: percentOf(expenses, baseline),
    }
}

// Rounded % of income spent, or null when there's no income to divide by
// (shown as "—" rather than a misleading 0% or Infinity).
export function spentOfIncomePercent(income, expenses) {
    return income > 0 ? Math.round((expenses / income) * 100) : null
}

// Adds each row's share of all spending (rounded, for the label) and its
// bar width relative to the largest category (so the top row is full).
export function toBreakdownRows(byCategory) {
    const grandTotal = sum(byCategory.map((row) => row.total))
    const largestTotal = Math.max(0, ...byCategory.map((row) => row.total))

    return byCategory.map((row) => ({
        ...row,
        sharePercent: Math.round(percentOf(row.total, grandTotal)),
        barWidth: percentOf(row.total, largestTotal),
    }))
}
