import { Modal } from '@components/Modal'
import { Card } from '@components/Card'
import { CategoryTile } from '@features/categories/components/CategoryTile'
import { categoryNameOf } from '@features/transactions/utils/transaction'
import { dayGroupLabel } from '@features/transactions/utils/dayGroups'
import { groupDraftsByMonth } from '@features/transactions/utils/draftGroups'

// Every Draft across all months, grouped by month (oldest first). Rows omit
// the amount and Draft badge: every entry here is a $0 Draft. Tapping one
// hands off to its edit form. Scrolls inside the modal so a long list
// still fits a phone screen.
export function DraftsSheet({ drafts, onSelect, onClose }) {
    const groups = groupDraftsByMonth(drafts)

    return (
        <Modal onRequestClose={onClose} contentClassName="max-w-md max-h-[85vh] overflow-y-auto">
            <h2 className="mb-4 text-lg font-medium">Drafts to finish</h2>
            <div className="space-y-5">
                {groups.map((group) => (
                    <section key={group.month} aria-label={group.label}>
                        <h3 className="mb-2 px-1 text-sm font-medium text-ink-soft">{group.label}</h3>
                        <Card className="divide-y divide-rule-soft">
                            {group.drafts.map((draft) => (
                                <button
                                    key={draft.id}
                                    type="button"
                                    onClick={() => onSelect(draft)}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                                >
                                    <CategoryTile colorKey={draft.category?.colorKey} iconKey={draft.category?.iconKey} />
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate">{categoryNameOf(draft)}</div>
                                        {draft.note && <div className="text-sm text-ink-soft truncate">{draft.note}</div>}
                                    </div>
                                    <span className="shrink-0 text-sm text-ink-soft">{dayGroupLabel(draft.date).formatted}</span>
                                </button>
                            ))}
                        </Card>
                    </section>
                ))}
            </div>
        </Modal>
    )
}
