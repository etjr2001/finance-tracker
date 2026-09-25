import { describe, it, expect } from 'vitest'
import { UtensilsCrossed, ShoppingCart, Bus, Tag } from 'lucide-react'
import { categoryIcon, guessIconKey, ICON_KEYS } from '@features/categories/utils/categoryIcon'

describe('categoryIcon', () => {
    it('resolves a known icon key', () => {
        expect(categoryIcon('utensils-crossed')).toBe(UtensilsCrossed)
    })

    it('falls back to the shared default for an unrecognized key', () => {
        expect(categoryIcon('not-a-real-key')).toBe(Tag)
    })

    it('falls back to the shared default when the key is missing', () => {
        expect(categoryIcon(undefined)).toBe(Tag)
        expect(categoryIcon(null)).toBe(Tag)
    })

    it('every ICON_KEYS entry resolves to its own distinct icon', () => {
        const resolved = ICON_KEYS.map(categoryIcon)
        expect(new Set(resolved).size).toBe(ICON_KEYS.length)
    })
})

describe('guessIconKey', () => {
    it('matches a known keyword', () => {
        expect(guessIconKey('Dining Out')).toBe('utensils-crossed')
    })

    it('is case-insensitive', () => {
        expect(guessIconKey('GROCERIES')).toBe('shopping-cart')
    })

    it('matches a keyword appearing anywhere in the name', () => {
        expect(guessIconKey('Public Transport')).toBe('bus')
    })

    it('returns null for an unrecognized name, rather than guessing wrong', () => {
        expect(guessIconKey('Miscellaneous')).toBeNull()
    })

    it('returns null when name is missing', () => {
        expect(guessIconKey(undefined)).toBeNull()
    })

    it('every guessed key resolves to a real (non-default) icon', () => {
        expect(categoryIcon(guessIconKey('Dining Out'))).toBe(UtensilsCrossed)
        expect(categoryIcon(guessIconKey('Groceries'))).toBe(ShoppingCart)
        expect(categoryIcon(guessIconKey('Transport'))).toBe(Bus)
    })
})
