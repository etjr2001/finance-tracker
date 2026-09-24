import { X } from 'lucide-react'
import Modal from './Modal'
import Money from './Money'
import Button from './Button'
import { categoryTileClasses } from '../lib/categorySwatch'
import { categoryIcon } from '../lib/categoryIcon'
import { dayGroupLabel } from '../lib/dayGroups'

// Read-only detail view for a Transaction row, opened by tapping the row
// below md: (the amended mobile-row spec, docs/backlog.md). Edit and
// Delete close this card and hand off to the page's existing
// openEdit/requestDelete flows — no mutation logic lives here.
export default function TransactionDetail({ transaction: t, onClose, onEdit, onDelete }) {
    const Icon = categoryIcon(t.category?.name)
    const { formatted } = dayGroupLabel(t.date)
    // Ink for individual amounts is a list-scanning rule (ADR0010: avoids
    // the Transactions list reading as a wall of red). A single hero
    // number here doesn't have that problem, so this follows the
    // Dashboard Net's color-follows-sign pattern instead.
    const amountColor = t.type === 'INCOME' ? 'text-deposit' : 'text-withdrawal'

    return (
        <Modal onRequestClose={onClose}>
            <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3 min-w-0">
                    {/* h-12 w-12 with a ~15px radius: ADR0010's "about a
                        third" rule, sized up from the row's h-9 w-9 tile
                        for this more prominent context. */}
                    <div
                        className={`h-12 w-12 shrink-0 rounded-[15px] flex items-center justify-center ${categoryTileClasses(t.category?.id ?? 0)}`}
                    >
                        <Icon aria-hidden="true" strokeWidth={1.7} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium truncate">{t.category?.name ?? 'Unknown category'}</span>
                            {Number(t.amount) === 0 && (
                                <span className="text-xs font-medium text-brass-ink bg-brass/10 border border-brass/30 rounded-full px-2 py-0.5 shrink-0">
                                    Draft
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-ink-soft">{formatted}</div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="h-11 w-11 -mt-2 -mr-2 shrink-0 flex items-center justify-center rounded-sm text-ink-soft hover:text-ink"
                >
                    <X aria-hidden="true" strokeWidth={1.7} className="h-5 w-5" />
                </button>
            </div>

            <div className={`font-serif font-semibold text-3xl tabular mb-5 ${amountColor}`}>
                {t.type === 'INCOME' ? '+' : '−'}
                <Money amount={t.amount} />
            </div>

            {t.note && <p className="text-sm text-ink-soft mb-5">{t.note}</p>}

            <div className="flex gap-3">
                <Button onClick={onEdit}>Edit</Button>
                <Button variant="dangerGhost" onClick={onDelete}>
                    Delete
                </Button>
            </div>
        </Modal>
    )
}
