import { useState } from 'react'

// Which item's detail card (DetailSheet, mobile) is open. Its Edit, Copy
// and Delete close the card, then hand the item to the page's existing
// flows. Shared by useTransactionEditor and useFavouriteEditor; `onCopy` is
// optional (Transactions only), and `copy` is null without it.
export function useDetailCard({ onEdit, onCopy = null, onDelete }) {
    const [target, setTarget] = useState(null)

    function handOff(handler) {
        setTarget(null)
        handler(target)
    }

    return {
        target,
        open: setTarget,
        close: () => setTarget(null),
        edit: () => handOff(onEdit),
        copy: onCopy ? () => handOff(onCopy) : null,
        delete: () => handOff(onDelete),
    }
}
