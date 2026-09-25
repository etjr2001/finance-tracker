import { createElement } from 'react'
import { categoryIcon } from '@features/categories/utils/categoryIcon'
import { categoryTileClasses } from '@features/categories/utils/categorySwatch'

// ADR0010: tile radius is ~a third of its size.
const SIZES = {
    md: { tile: 'h-9 w-9 rounded-xl', icon: 'h-4 w-4' },
    lg: { tile: 'h-12 w-12 rounded-[15px]', icon: 'h-5 w-5' },
}

// Coloured icon tile for a Category, keyed by its own colour_key/icon_key
// (docs/backlog.md, "Category color/icon"). Either can be null — a
// Category that's never had one chosen, or one created before this
// existed — and both lookups fall back to one fixed default.
export function CategoryTile({ colorKey, iconKey, size = 'md' }) {
    const { tile, icon } = SIZES[size]
    // createElement (not `const Icon = …; <Icon />`) because the icon is
    // looked up at render time; a JSX component variable created during
    // render would be flagged as a new component type every render.
    const iconElement = createElement(categoryIcon(iconKey), {
        'aria-hidden': 'true',
        strokeWidth: 1.7,
        className: icon,
    })

    return (
        <div className={`${tile} shrink-0 flex items-center justify-center ${categoryTileClasses(colorKey)}`}>
            {iconElement}
        </div>
    )
}
