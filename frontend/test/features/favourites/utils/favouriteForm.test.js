import { describe, it, expect } from 'vitest'
import {
    describeFavourite,
    emptyFavouriteForm,
    favouriteName,
    hasNoAmount,
    sortFavouritesByName,
    toFavouriteFormShape,
    toFavouritePayload,
} from '@features/favourites/utils/favouriteForm'

const rent = { id: 1, type: 'EXPENSE', amount: 1500, note: null, category: { id: 2, name: 'Rent' } }

describe('favouriteForm', () => {
    it('starts as a zero-amount Expense with no Category, and has no date field', () => {
        const form = emptyFavouriteForm()
        expect(form).toEqual({ type: 'EXPENSE', amount: '0', note: '', categoryId: '' })
        expect(form).not.toHaveProperty('date')
    })

    it('maps a Favourite to string form values, with a null note as empty', () => {
        expect(toFavouriteFormShape(rent)).toEqual({ type: 'EXPENSE', amount: '1500', note: '', categoryId: '2' })
    })

    it('builds the API payload, sending an empty note as null and no date', () => {
        const payload = toFavouritePayload({ type: 'INCOME', amount: '12.50', note: '', categoryId: '3' })
        expect(payload).toEqual({ type: 'INCOME', amount: 12.5, note: null, categoryId: 3 })
    })

    it('keeps a non-empty note in the payload', () => {
        const payload = toFavouritePayload({ type: 'EXPENSE', amount: '4', note: 'Kopi', categoryId: '1' })
        expect(payload.note).toBe('Kopi')
    })

    it('treats only a zero amount as having no amount', () => {
        expect(hasNoAmount({ amount: 0 })).toBe(true)
        expect(hasNoAmount({ amount: '0.00' })).toBe(true)
        expect(hasNoAmount({ amount: 0.01 })).toBe(false)
    })

    it('names a Favourite by its note, or its Category when it has none', () => {
        expect(favouriteName(rent)).toBe('Rent')
        expect(favouriteName({ ...rent, note: 'Monthly' })).toBe('Monthly')
    })

    it('sorts A–Z by name ignoring case, oldest first among equal names, without mutating the input', () => {
        const input = [
            { id: 4, note: null, category: { name: 'rent' } },
            { id: 2, note: 'Bills', category: { name: 'Rent' } },
            { id: 3, note: null, category: { name: 'Rent' } },
            { id: 1, note: 'apples', category: { name: 'Groceries' } },
        ]

        expect(sortFavouritesByName(input).map((f) => f.id)).toEqual([1, 2, 3, 4])
        expect(input.map((f) => f.id)).toEqual([4, 2, 3, 1])
    })

    it('describes a Favourite by Category, adding the note when there is one', () => {
        expect(describeFavourite(rent)).toBe('Rent')
        expect(describeFavourite({ ...rent, note: 'Monthly' })).toBe('Rent — Monthly')
    })
})
