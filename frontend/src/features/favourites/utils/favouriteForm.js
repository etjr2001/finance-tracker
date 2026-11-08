import { TRANSACTION_TYPES, categoryNameOf } from '@features/transactions/utils/transaction'

// A Favourite is a Transaction's fields minus the date (ADR0017), so the
// form shape and payload mirror transactionForm.js without `date`.
export function emptyFavouriteForm() {
    return {
        type: TRANSACTION_TYPES.EXPENSE,
        amount: '0',
        note: '',
        categoryId: '',
    }
}

export function toFavouriteFormShape(favourite) {
    return {
        type: favourite.type,
        amount: String(favourite.amount),
        note: favourite.note ?? '',
        categoryId: String(favourite.category?.id ?? ''),
    }
}

export function toFavouritePayload(form) {
    return {
        type: form.type,
        amount: Number(form.amount),
        note: form.note || null,
        categoryId: Number(form.categoryId),
    }
}

// Zero means "amount filled in when used", so using it starts a Draft
// (ADR0017). Not called isDraft: a Draft is a Transaction, and a Favourite
// isn't one.
export function hasNoAmount(favourite) {
    return Number(favourite.amount) === 0
}

// What a Favourite is called in lists: its note, or its Category when it
// has none.
export function favouriteName(favourite) {
    return favourite.note || categoryNameOf(favourite)
}

// A–Z by name, ignoring case and accents; oldest first among equal names
// so the order is stable. A custom order may come later (docs/backlog.md).
export function sortFavouritesByName(favourites) {
    return [...favourites].sort(
        (a, b) => favouriteName(a).localeCompare(favouriteName(b), undefined, { sensitivity: 'base' }) || a.id - b.id
    )
}

// Human description used in the delete confirmation, e.g. "Rent" or
// "Dining Out — Kopi".
export function describeFavourite(favourite) {
    const categoryName = categoryNameOf(favourite)
    return favourite.note ? `${categoryName} — ${favourite.note}` : categoryName
}
