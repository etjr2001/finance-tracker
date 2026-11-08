import { hasNoAmount } from '@features/favourites/utils/favouriteForm'

// Which Favourite (if any) a Transaction "already is", for the filled star
// and for opening that Favourite's Edit form. Nothing links a Transaction to
// the Favourite it came from (ADR0017), so this is worked out by comparing
// fields, never stored:
//   - same type and same Category
//   - same amount to the cent, except that a zero-amount Favourite ("fill
//     in the amount when used") matches any amount
//   - same note, ignoring case and surrounding spaces; no note and an
//     empty note count as the same
// The date is ignored: a Favourite has none.
//
// With several matches (duplicates are allowed), an exact-amount Favourite
// wins over a zero-amount one, and the oldest wins among equals, so the
// same Transaction always resolves to the same Favourite.

const ANY_AMOUNT = 'any'

function toCents(amount) {
    return Math.round(Number(amount) * 100)
}

function normaliseNote(note) {
    return (note ?? '').trim().toLowerCase()
}

function matchKey(type, categoryId, amountKey, note) {
    return `${type}|${categoryId}|${amountKey}|${normaliseNote(note)}`
}

// Builds the lookup once per Favourites list, so checking each Transaction
// is one or two Map lookups however many Favourites there are. Returns
// (transaction) => the matching Favourite, or null.
export function buildFavouriteMatcher(favourites = []) {
    const byKey = new Map()
    const oldestFirst = [...favourites].sort((a, b) => a.id - b.id)
    for (const favourite of oldestFirst) {
        const amountKey = hasNoAmount(favourite) ? ANY_AMOUNT : toCents(favourite.amount)
        const key = matchKey(favourite.type, favourite.category?.id, amountKey, favourite.note)
        if (!byKey.has(key)) byKey.set(key, favourite)
    }

    return function findMatchingFavourite(transaction) {
        const { type, note } = transaction
        const categoryId = transaction.category?.id
        return (
            byKey.get(matchKey(type, categoryId, toCents(transaction.amount), note)) ??
            byKey.get(matchKey(type, categoryId, ANY_AMOUNT, note)) ??
            null
        )
    }
}
