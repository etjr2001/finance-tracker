import { describe, it, expect } from 'vitest'
import { formatMoney } from '../../src/lib/money'

describe('formatMoney', () => {
    it('formats SGD with a plain dollar sign regardless of browser locale', () => {
        expect(formatMoney(4200)).toBe('$4,200.00')
    })

    it('accepts numeric strings from the API', () => {
        expect(formatMoney('908.37')).toBe('$908.37')
    })

    it('uses U+2212 for negative amounts, not a hyphen-minus', () => {
        expect(formatMoney(-957.5)).toBe('−$957.50')
    })

    it('does not put a minus sign on negative zero', () => {
        expect(formatMoney(-0)).toBe('$0.00')
    })
})
