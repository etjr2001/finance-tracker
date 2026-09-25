import { describe, it, expect } from 'vitest'
import { roundHalfEven } from '@features/demo/utils/demoMoney'

describe('roundHalfEven', () => {
    it('rounds an exact tie down to the nearest even cent', () => {
        expect(roundHalfEven(1.005)).toBe(1.0)
    })

    it('rounds an exact tie up to the nearest even cent', () => {
        expect(roundHalfEven(1.015)).toBe(1.02)
    })

    it('rounds non-tie values normally', () => {
        expect(roundHalfEven(1.006)).toBe(1.01)
        expect(roundHalfEven(1.004)).toBe(1.0)
    })

    it('leaves already-exact 2-decimal values unchanged', () => {
        expect(roundHalfEven(42.5)).toBe(42.5)
        expect(roundHalfEven(0)).toBe(0)
    })
})
