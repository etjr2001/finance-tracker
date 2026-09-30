import { Trash2 } from 'lucide-react'
import { Modal } from '@components/Modal'
import { Card } from '@components/Card'
import { IconButton } from '@components/IconButton'
import { CategoryTile } from '@features/categories/components/CategoryTile'
import { categoryNameOf } from '@features/transactions/utils/transaction'
import { dayGroupLabel } from '@features/transactions/utils/dayGroups'
import { groupDraftsByMonth } from '@features/transactions/utils/draftGroups'

// Every Draft across all months, grouped by month (oldest first). Rows omit
// the amount and Draft badge: every entry here is a $0 Draft. Tapping a row
// hands off to its edit form; the trash button starts the usual delete
// confirmation, so a stale Draft can be cleared without hunting for it in
// its month. Scrolls inside the modal so a long list still fits a phone
// screen.
export function DraftsSheet({ drafts, isDeleting, onSelect, onDelete, onClose }) {
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
                                <div key={draft.id} className="flex items-center pr-1">
                                    <button
                                        type="button"
                                        onClick={() => onSelect(draft)}
                                        className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-4 pr-2 text-left"
                                    >
                                        <CategoryTile colorKey={draft.category?.colorKey} iconKey={draft.category?.iconKey} />
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate">{categoryNameOf(draft)}</div>
                                            {draft.note && <div className="text-sm text-ink-soft truncate">{draft.note}</div>}
                                        </div>
                                        <span className="shrink-0 text-sm text-ink-soft">{dayGroupLabel(draft.date).formatted}</span>
                                    </button>
                                    <IconButton
                                        icon={Trash2}
                                        label="Delete"
                                        tone="danger"
                                        isDisabled={isDeleting(draft.id)}
                                        onClick={() => onDelete(draft)}
                                    />
                                </div>
                            ))}
                        </Card>
                    </section>
                ))}
            </div>
        </Modal>
    )
}
