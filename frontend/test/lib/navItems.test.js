import { describe, it, expect } from 'vitest'
import { resolveNavItems, toDemoPath } from '@features/layout/utils/navItems'

describe('resolveNavItems', () => {
    it('prefixes demo routes with /demo', () => {
        expect(toDemoPath('/')).toBe('/demo')
        expect(toDemoPath('/categories')).toBe('/demo/categories')
    })

    it('carries the month only onto month-scoped links', () => {
        const items = resolveNavItems({ isDemo: false, carriedMonth: '2026-03' })
        const byLabel = Object.fromEntries(items.map((item) => [item.label, item.to]))
        expect(byLabel.Dashboard).toEqual({ pathname: '/', search: '?month=2026-03' })
        expect(byLabel.Categories).toBe('/categories')
    })

    it('uses plain paths when no month is known', () => {
        const items = resolveNavItems({ isDemo: true, carriedMonth: null })
        expect(items.map((item) => item.to)).toEqual(['/demo', '/demo/transactions', '/demo/categories'])
    })
})
