import { PageTitle } from '@components/PageTitle'
import { AddButton } from '@components/AddButton'
import { StatusMessage } from '@components/StatusMessage'
import { MonthBar } from '@features/month/components/MonthBar'
import { useCategories } from '@features/categories/hooks/useCategories'
import { useMonthTransactions } from '@features/transactions/hooks/useMonthTransactions'
import { useTransactionEditor } from '@features/transactions/hooks/useTransactionEditor'
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
    const { error, form, discard, remove, detail } = useTransactionEditor({ month, onMonthChange: setMonth })

    return (
        <div>
            {/* Title on its own row, matching the other pages exactly;
                MonthBar + Add share the next row without wrapping. */}
            <PageTitle>Transactions</PageTitle>
            <div className="flex items-center justify-between gap-3 mb-6">
                <MonthBar month={month} onChange={setMonth} />
                {!form.isOpen && <AddButton onClick={form.openCreate} />}
            </div>

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
