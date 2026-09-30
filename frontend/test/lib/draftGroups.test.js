import { describe, it, expect } from 'vitest'
import { groupDraftsByMonth } from '@features/transactions/utils/draftGroups'

const draft = (id, date) => ({ id, date, amount: 0 })

describe('groupDraftsByMonth', () => {
    it('returns no groups for no Drafts', () => {
        expect(groupDraftsByMonth([])).toEqual([])
    })

    it('groups consecutive same-month Drafts, preserving oldest-first order', () => {
        const groups = groupDraftsByMonth([
            draft(1, '2026-08-05'),
            draft(2, '2026-08-20'),
            draft(3, '2026-09-01'),
        ])

        expect(groups.map((g) => [g.month, g.label, g.drafts.map((d) => d.id)])).toEqual([
            ['2026-08', 'August 2026', [1, 2]],
            ['2026-09', 'September 2026', [3]],
        ])
    })
})
