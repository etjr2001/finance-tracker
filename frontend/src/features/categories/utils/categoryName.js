export const MAX_CATEGORY_NAME_LENGTH = 50

export const UNKNOWN_CATEGORY_NAME = 'Unknown category'

// Category names are unique per User ignoring case (CONTEXT.md).
export function findCategoryByName(categories, name) {
    const target = name.toLowerCase()
    return categories.find((category) => category.name.toLowerCase() === target)
}

export function sortCategoriesByName(categories) {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name))
}
