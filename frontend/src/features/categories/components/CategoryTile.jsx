import { createElement } from 'react'
import { categoryIcon } from '@features/categories/utils/categoryIcon'
import { categoryTileClasses } from '@features/categories/utils/categorySwatch'

// ADR0010: tile radius is ~a third of its size.
const SIZES = {
    md: { tile: 'h-9 w-9 rounded-xl', icon: 'h-4 w-4' },
    lg: { tile: 'h-12 w-12 rounded-[15px]', icon: 'h-5 w-5' },
}

// Coloured icon tile for a Category. Colour is deterministic by id and the
// icon is guessed from the name — both stopgaps until real per-Category
// colour/icon exists (ADR0010, docs/backlog.md Sprint 3).
export function CategoryTile({ categoryId, categoryName, size = 'md' }) {
    const { tile, icon } = SIZES[size]
    // createElement (not `const Icon = …; <Icon />`) because the icon is
    // looked up at render time; a JSX component variable created during
    // render would be flagged as a new component type every render.
    const iconElement = createElement(categoryIcon(categoryName), {
        'aria-hidden': 'true',
        strokeWidth: 1.7,
        className: icon,
    })

    return (
        <div className={`${tile} shrink-0 flex items-center justify-center ${categoryTileClasses(categoryId ?? 0)}`}>
            {iconElement}
        </div>
    )
}
