import { formatMonth, monthOf } from '@utils/date'

// Groups Drafts for the "Drafts to finish" sheet: [{ month, label, drafts }].
// The API returns Drafts oldest first (GET /api/transactions/drafts), so only
// consecutive same-month entries are grouped and input order is trusted,
// giving oldest month first and oldest date first within each.
export function groupDraftsByMonth(drafts) {
    const groups = []
    let current = null

    for (const draft of drafts) {
        const month = monthOf(draft.date)
        if (current?.month !== month) {
            current = { month, label: formatMonth(month), drafts: [] }
            groups.push(current)
        }
        current.drafts.push(draft)
    }

    return groups
}
