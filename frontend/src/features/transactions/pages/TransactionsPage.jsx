import { useState } from 'react'
import { PageTitle } from '@components/PageTitle'
import { AddButton } from '@components/AddButton'
import { StatusMessage } from '@components/StatusMessage'
import { MonthBar } from '@features/month/components/MonthBar'
import { useCategories } from '@features/categories/hooks/useCategories'
import { useMonthTransactions } from '@features/transactions/hooks/useMonthTransactions'
import { useDrafts } from '@features/transactions/hooks/useTransactions'
import { useTransactionEditor } from '@features/transactions/hooks/useTransactionEditor'
import { DraftsNotice } from '@features/transactions/components/DraftsNotice'
import { DraftsSheet } from '@features/transactions/components/DraftsSheet'
import { TransactionList } from '@features/transactions/components/TransactionList'
import { TransactionFormModal } from '@features/transactions/components/TransactionFormModal'
import { TransactionDialogs } from '@features/transactions/components/TransactionDialogs'
import { useIsMobile } from '@hooks/useIsMobile'
import { useSelectedMonth } from '@hooks/useSelectedMonth'

export function TransactionsPage() {
    const [month, setMonth] = useSelectedMonth()
    const isMobile = useIsMobile()
    const { data: categories } = useCategories()
    const { dayGroups, isLoading, hasError } = useMonthTransactions(month)
    const { data: drafts = [] } = useDrafts()
    const [isDraftsSheetOpen, setIsDraftsSheetOpen] = useState(false)
    const { error, form, discard, remove, detail } = useTransactionEditor({ month, onMonthChange: setMonth })

    // Nothing left to show once the last Draft is finished or deleted. Also
    // resets the flag, so a later Draft doesn't reopen the sheet by itself.
    if (isDraftsSheetOpen && drafts.length === 0) setIsDraftsSheetOpen(false)

    function editDraft(draft) {
        setIsDraftsSheetOpen(false)
        form.openEdit(draft)
    }

    return (
        <div>
            {/* Title on its own row, matching the other pages exactly;
                MonthBar + Add share the next row without wrapping. */}
            <PageTitle>Transactions</PageTitle>
            <div className="flex items-center justify-between gap-3 mb-6">
                <MonthBar month={month} onChange={setMonth} />
                {!form.isOpen && <AddButton onClick={form.openCreate} />}
            </div>

            <DraftsNotice count={drafts.length} onOpen={() => setIsDraftsSheetOpen(true)} />

            {isDraftsSheetOpen && (
                <DraftsSheet
                    drafts={drafts}
                    isDeleting={remove.isDeleting}
                    onSelect={editDraft}
                    onDelete={remove.request}
                    // Escape belongs to the delete confirmation while it's open.
                    onClose={() => !remove.target && setIsDraftsSheetOpen(false)}
                />
            )}

            {/* While a form is open, its modal shows the error instead. */}
            {error && !form.isOpen && (
                <StatusMessage tone="error" className="mb-4">
                    {error}
                </StatusMessage>
            )}

            {form.isOpen && (
                <TransactionFormModal
                    transaction={form.transaction}
                    categories={categories}
                    error={error}
                    isSubmitting={form.isSubmitting}
                    onSubmit={form.submit}
                    onRequestClose={form.requestClose}
                    onDirtyChange={form.setIsDirty}
                />
            )}

            <TransactionList
                dayGroups={dayGroups}
                month={month}
                isLoading={isLoading}
                hasError={hasError}
                isMobile={isMobile}
                isDeleting={remove.isDeleting}
                onOpenDetail={detail.open}
                onEdit={form.openEdit}
                onDelete={remove.request}
            />

            <TransactionDialogs discard={discard} remove={remove} detail={detail} />
        </div>
    )
}
