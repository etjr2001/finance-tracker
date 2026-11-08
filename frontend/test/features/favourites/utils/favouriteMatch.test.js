import { describe, it, expect } from 'vitest'
import { buildFavouriteMatcher } from '@features/favourites/utils/favouriteMatch'

const groceries = { id: 1, name: 'Groceries' }
const utilities = { id: 2, name: 'Utilities' }

const kopi = { id: 10, type: 'EXPENSE', amount: 4.5, note: 'Kopi', category: groceries }
const bills = { id: 11, type: 'EXPENSE', amount: 0, note: null, category: utilities }

function tx(fields) {
    return { id: 99, type: 'EXPENSE', amount: 4.5, date: '2026-11-08', note: 'Kopi', category: groceries, ...fields }
}

describe('buildFavouriteMatcher', () => {
    const match = buildFavouriteMatcher([kopi, bills])

    it('matches on type, Category, amount and note, ignoring the date', () => {
        expect(match(tx({ date: '2020-01-01' }))).toBe(kopi)
    })

    it('treats 4.5 and "4.50" as the same amount', () => {
        expect(match(tx({ amount: '4.50' }))).toBe(kopi)
    })

    it('ignores case and surrounding spaces in the note', () => {
        expect(match(tx({ note: '  kOPI ' }))).toBe(kopi)
    })

    it('treats no note and an empty note as the same', () => {
        expect(match(tx({ category: utilities, amount: 120.75, note: '' }))).toBe(bills)
    })

    it('does not match when any field differs', () => {
        expect(match(tx({ type: 'INCOME' }))).toBeNull()
        expect(match(tx({ category: { id: 3 } }))).toBeNull()
        expect(match(tx({ amount: 5 }))).toBeNull()
        expect(match(tx({ note: 'Teh' }))).toBeNull()
    })

    it('lets a zero-amount Favourite match any amount, including a Draft', () => {
        expect(match(tx({ category: utilities, note: null, amount: 120.75 }))).toBe(bills)
        expect(match(tx({ category: utilities, note: null, amount: 0 }))).toBe(bills)
    })

    it('does not let an exact-amount Favourite match a Draft', () => {
        expect(match(tx({ amount: 0 }))).toBeNull()
    })

    it('prefers an exact-amount match over a zero-amount one, and the oldest among equals', () => {
        const kopiAnyAmount = { ...kopi, id: 5, amount: 0 }
        const kopiDuplicate = { ...kopi, id: 20 }
        const matcher = buildFavouriteMatcher([kopiDuplicate, kopiAnyAmount, kopi])

        expect(matcher(tx())).toBe(kopi)
        expect(matcher(tx({ amount: 9 }))).toBe(kopiAnyAmount)
    })

    it('matches nothing with no Favourites', () => {
        expect(buildFavouriteMatcher()(tx())).toBeNull()
    })
})
