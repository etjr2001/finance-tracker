import { describe, it, expect } from 'vitest'
import {
    incomeExpenseBarWidths,
    spentOfIncomePercent,
    toBreakdownRows,
} from '@features/dashboard/utils/dashboardMath'

describe('incomeExpenseBarWidths', () => {
    it('uses the larger of the two as the 100% baseline', () => {
        expect(incomeExpenseBarWidths(1000, 250)).toEqual({ incomeWidth: 100, expenseWidth: 25 })
        expect(incomeExpenseBarWidths(250, 1000)).toEqual({ incomeWidth: 25, expenseWidth: 100 })
    })

    it('returns 0 widths when both are 0', () => {
        expect(incomeExpenseBarWidths(0, 0)).toEqual({ incomeWidth: 0, expenseWidth: 0 })
    })
})

describe('spentOfIncomePercent', () => {
    it('rounds the share of income spent', () => {
        expect(spentOfIncomePercent(300, 100)).toBe(33)
    })

    it('is null with no income to divide by', () => {
        expect(spentOfIncomePercent(0, 50)).toBeNull()
    })
})

describe('toBreakdownRows', () => {
    it('adds a rounded share of all spending and a bar width relative to the largest row', () => {
        const rows = toBreakdownRows([
            { categoryId: 1, categoryName: 'Rent', total: 300 },
            { categoryId: 2, categoryName: 'Food', total: 100 },
        ])
        expect(rows.map((r) => [r.sharePercent, r.barWidth])).toEqual([
            [75, 100],
            [25, (100 / 300) * 100],
        ])
    })

    it('handles an empty breakdown', () => {
        expect(toBreakdownRows([])).toEqual([])
    })
})
