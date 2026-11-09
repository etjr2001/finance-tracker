import { AddButton } from '@components/AddButton'

// The row under a page's PageTitle: the page's own content on the left
// (e.g. MonthBar, a short description) and its "+ Add" on the right. Shared
// so pages with an add flow keep the same spacing. Add always shows: the
// add/edit form opens as a modal over it, so hiding it would only shift the
// layout behind the modal.
export function PageToolbar({ onAdd, children }) {
    return (
        <div className="flex items-center justify-between gap-3 mb-6">
            {children}
            <AddButton onClick={onAdd} />
        </div>
    )
}
