import { describe, it, expect } from 'vitest'
import { findCategoryByName, sortCategoriesByName } from '@features/categories/utils/categoryName'

describe('categoryName helpers', () => {
    const categories = [
        { id: 2, name: 'Salary' },
        { id: 1, name: 'Groceries' },
    ]

    it('finds a category ignoring case', () => {
        expect(findCategoryByName(categories, 'groceries')?.id).toBe(1)
        expect(findCategoryByName(categories, 'rent')).toBeUndefined()
    })

    it('sorts by name without mutating the input', () => {
        expect(sortCategoriesByName(categories).map((c) => c.id)).toEqual([1, 2])
        expect(categories[0].id).toBe(2)
    })
})
