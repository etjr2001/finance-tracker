import { describe, it, expect } from 'vitest'
import { buildSeedCategories, buildSeedTransactions } from '../../src/demo/demoSeed'

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
})
