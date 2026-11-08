import { describe, it, expect } from 'vitest'
import { buildSeedCategories, buildSeedFavourites, buildSeedTransactions } from '@features/demo/utils/demoSeed'

describe('demoSeed', () => {
    const categories = buildSeedCategories()
    const transactions = buildSeedTransactions(categories)

    it('has no zero-amount (Draft) transactions', () => {
        expect(transactions.every((t) => t.amount > 0)).toBe(true)
    })

    it('references only categories that exist in the seed category list', () => {
        const categoryIds = new Set(categories.map((c) => c.id))
        expect(transactions.every((t) => categoryIds.has(t.category.id))).toBe(true)
    })

    it('never dates a transaction after today', () => {
        const today = new Date().toISOString().slice(0, 10)
        expect(transactions.every((t) => t.date <= today)).toBe(true)
    })

    it('includes at least one transaction with a note', () => {
        expect(transactions.some((t) => t.note)).toBe(true)
    })

    describe('favourites', () => {
        const favourites = buildSeedFavourites(categories)

        it('seeds one Favourite with an amount and one that prefills a Draft', () => {
            expect(favourites.map((f) => [f.category.name, f.type, f.amount])).toEqual([
                ['Rent', 'EXPENSE', 1500],
                ['Utilities', 'EXPENSE', 0],
            ])
        })

        it('uses the same shape as the real API, with unique ids', () => {
            const rent = categories.find((c) => c.name === 'Rent')

            expect(favourites[0]).toEqual({
                id: 1,
                type: 'EXPENSE',
                amount: 1500,
                note: null,
                category: { id: rent.id, name: 'Rent', colorKey: rent.colorKey, iconKey: rent.iconKey },
            })
            expect(new Set(favourites.map((f) => f.id)).size).toBe(favourites.length)
        })
    })
})
