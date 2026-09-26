import { Button } from '@components/Button'
import { AddButton } from '@components/AddButton'
import { FormField } from '@components/FormField'
import { useTransactionFormState } from '@features/transactions/hooks/useTransactionFormState'
import { useInlineCategoryCreate } from '@features/transactions/hooks/useInlineCategoryCreate'
import { MAX_NOTE_LENGTH } from '@features/transactions/utils/transactionForm'
import { TransactionTypeToggle } from '@features/transactions/components/TransactionTypeToggle'
import { AmountField } from '@features/transactions/components/AmountField'
import { DateField } from '@features/transactions/components/DateField'
import { CategorySelect } from '@features/transactions/components/CategorySelect'
import { NewCategoryModal } from '@features/transactions/components/NewCategoryModal'

// Create/edit form for a Transaction. The parent must pass a `key` (e.g.
// key={initial?.id ?? 'new'}) so switching targets remounts it.
// `onDirtyChange` should be stable (e.g. a useState setter).
export function TransactionForm({ categories, initial, onSubmit, onCancel, isSubmitting, onDirtyChange }) {
    const { form, updateField, changeAmount, amountHint, isDraftAmount, toPayload } = useTransactionFormState(
        initial,
        onDirtyChange
    )
    const newCategory = useInlineCategoryCreate({
        categories,
        onSelect: (categoryId) => updateField('categoryId', categoryId),
    })
    const isEditing = Boolean(initial)

    function handleSubmit(event) {
        event.preventDefault()
        onSubmit(toPayload())
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TransactionTypeToggle value={form.type} onChange={(type) => updateField('type', type)} />
                <AmountField value={form.amount} onChange={changeAmount} hint={amountHint} />
                <DateField value={form.date} onChange={(date) => updateField('date', date)} />

                {isDraftAmount && (
                    <p className="md:col-span-2 -mt-1.5 text-xs text-ink-soft">Will show as a Draft (0 amount)</p>
                )}

                <CategorySelect
                    categories={newCategory.sortedCategories}
                    value={form.categoryId}
                    onChange={(categoryId) => updateField('categoryId', categoryId)}
                    onRequestNew={newCategory.open}
                />
                <FormField
                    label="Note (optional)"
                    htmlFor="note"
                    type="text"
                    maxLength={MAX_NOTE_LENGTH}
                    value={form.note}
                    onChange={(event) => updateField('note', event.target.value)}
                />

                <div className="md:col-span-2 flex gap-4 pt-1">
                    {/* Add gets the shared + icon (it adds a Transaction);
                        Save changes doesn't — it's an edit. */}
                    {isEditing ? (
                        <Button type="submit" disabled={isSubmitting}>
                            Save changes
                        </Button>
                    ) : (
                        <AddButton type="submit" disabled={isSubmitting}>
                            Add transaction
                        </AddButton>
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
