import { useState } from 'react'

// Which item's detail card (DetailSheet, mobile) is open. Its Edit and
// Delete close the card, then hand the item to the page's existing edit
// and delete flows. Shared by useTransactionEditor and useFavouriteEditor.
export function useDetailCard({ onEdit, onDelete }) {
    const [target, setTarget] = useState(null)

    return {
        target,
        open: setTarget,
        close: () => setTarget(null),
        edit: () => {
            setTarget(null)
            onEdit(target)
        },
        delete: () => {
            setTarget(null)
            onDelete(target)
        },
    }
}
