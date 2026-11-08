import { Button } from '@components/Button'
import { AddButton } from '@components/AddButton'
import { SectionTitle } from '@components/SectionTitle'
import { FormField } from '@components/FormField'
import { useAmountFormState } from '@features/transactions/hooks/useAmountFormState'
import { useInlineCategoryCreate } from '@features/transactions/hooks/useInlineCategoryCreate'
import { MAX_NOTE_LENGTH } from '@features/transactions/utils/transactionForm'
import { TransactionTypeToggle } from '@features/transactions/components/TransactionTypeToggle'
import { AmountField } from '@features/transactions/components/AmountField'
import { CategorySelect } from '@features/transactions/components/CategorySelect'
import { NewCategoryModal } from '@features/transactions/components/NewCategoryModal'
import {
    emptyFavouriteForm,
    toFavouriteFormShape,
    toFavouritePayload,
} from '@features/favourites/utils/favouriteForm'

// Create/edit form for a Favourite: the Transaction form's fields minus the
// date (ADR0017). The parent must pass a `key` (e.g.
// key={initial?.id ?? 'new'}) so switching targets remounts it.
// `onDirtyChange` should be stable (e.g. a useState setter).
export function FavouriteForm({ categories, initial, onSubmit, onCancel, isSubmitting, onDirtyChange }) {
    const { form, updateField, changeAmount, amountHint, isZeroAmount } = useAmountFormState(
        () => (initial ? toFavouriteFormShape(initial) : emptyFavouriteForm()),
        onDirtyChange
    )
    const newCategory = useInlineCategoryCreate({
        categories,
        onSelect: (categoryId) => updateField('categoryId', categoryId),
    })
    const isEditing = Boolean(initial)

    function handleSubmit(event) {
        event.preventDefault()
        onSubmit(toFavouritePayload(form))
    }

    return (
        <>
            <SectionTitle className="mb-4">{isEditing ? 'Edit favourite' : 'Add favourite'}</SectionTitle>
            {/* Same order as TransactionForm minus Date: Category, Amount,
                then Note full width. items-start keeps Amount's helper from
                pushing it out of line with Category. */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 items-start gap-3">
                <TransactionTypeToggle value={form.type} onChange={(type) => updateField('type', type)} />
                <CategorySelect
                    categories={newCategory.sortedCategories}
                    value={form.categoryId}
                    onChange={(categoryId) => updateField('categoryId', categoryId)}
                    onRequestNew={newCategory.open}
                />
                <AmountField
                    value={form.amount}
                    onChange={changeAmount}
                    hint={amountHint}
                    helper={isZeroAmount ? '0 starts a Draft' : null}
                />
                <FormField
                    label="Note (optional)"
                    htmlFor="note"
                    type="text"
                    className="md:col-span-2"
                    maxLength={MAX_NOTE_LENGTH}
                    value={form.note}
                    onChange={(event) => updateField('note', event.target.value)}
                    helper="Names the favourite; copied to each transaction"
                />

                <div className="md:col-span-2 flex gap-4 pt-1">
                    {/* Disabled while in flight, so a double tap can't save
                        a duplicate (duplicates are allowed, ADR0017). */}
                    {/* Same labels as TransactionForm: + Add to create, Save
                        changes to edit. */}
                    {isEditing ? (
                        <Button type="submit" disabled={isSubmitting}>
                            Save changes
                        </Button>
                    ) : (
                        <AddButton type="submit" disabled={isSubmitting} />
                    )}
                    {onCancel && (
                        <Button variant="ghost" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                </div>
            </form>

            {newCategory.isOpen && (
                <NewCategoryModal
                    name={newCategory.name}
                    onNameChange={newCategory.setName}
                    error={newCategory.error}
                    isCreating={newCategory.isCreating}
                    onCreate={newCategory.create}
                    onCancel={newCategory.close}
                />
            )}
        </>
    )
}
