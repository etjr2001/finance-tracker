import { describe, it, expect } from 'vitest'
import { dayGroupLabel, groupByDay } from '../../src/lib/dayGroups'

const today = new Date(2026, 8, 23) // Wed 23 Sep 2026

describe('dayGroupLabel', () => {
    it('labels today as Today, plus the formatted date', () => {
        expect(dayGroupLabel('2026-09-23', today)).toEqual({ relative: 'Today', formatted: 'Wed 23 Sep' })
    })

    it('labels yesterday as Yesterday, plus the formatted date', () => {
        expect(dayGroupLabel('2026-09-22', today)).toEqual({ relative: 'Yesterday', formatted: 'Tue 22 Sep' })
    })

    it('has no relative label for older dates', () => {
        expect(dayGroupLabel('2026-08-15', today)).toEqual({ relative: null, formatted: 'Sat 15 Aug' })
    })

    it('has no relative label for a date across a year boundary', () => {
        expect(dayGroupLabel('2025-09-23', today)).toEqual({ relative: null, formatted: 'Tue 23 Sep' })
    })
})

describe('groupByDay', () => {
    it('groups consecutive same-date transactions into one section', () => {
        const transactions = [
            { id: 1, date: '2026-09-23', type: 'EXPENSE', amount: 5 },
            { id: 2, date: '2026-09-23', type: 'EXPENSE', amount: 3 },
            { id: 3, date: '2026-09-22', type: 'INCOME', amount: 10 },
        ]

        const groups = groupByDay(transactions, today)

        expect(groups).toHaveLength(2)
        expect(groups[0].date).toBe('2026-09-23')
        expect(groups[0].transactions).toHaveLength(2)
        expect(groups[1].date).toBe('2026-09-22')
        expect(groups[1].transactions).toHaveLength(1)
    })

    it('sums a signed day total: income positive, expense negative', () => {
        const transactions = [
            { id: 1, date: '2026-09-23', type: 'EXPENSE', amount: 5.5 },
            { id: 2, date: '2026-09-23', type: 'INCOME', amount: 20 },
        ]

        const [group] = groupByDay(transactions, today)

        expect(group.total).toBeCloseTo(14.5)
    })

    it('treats a Draft (0 amount) as contributing 0 to the day total', () => {
        const transactions = [{ id: 1, date: '2026-09-23', type: 'EXPENSE', amount: 0 }]

        const [group] = groupByDay(transactions, today)

        expect(group.total).toBe(0)
    })

    it('returns an empty array for no transactions', () => {
        expect(groupByDay([], today)).toEqual([])
    })
})
