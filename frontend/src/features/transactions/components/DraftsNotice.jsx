// "N Drafts to finish": shown whenever any Draft exists, in the viewed month
// or not (docs/backlog.md, Sprint 3 Bundle A). Opens the DraftsSheet.
export function DraftsNotice({ count, onOpen }) {
    if (count === 0) return null

    return (
        <button
            type="button"
            onClick={onOpen}
            className="mb-4 w-full min-h-11 rounded-xl border border-rule bg-paper-raised px-4 py-2 text-left text-sm"
        >
            <span className="font-medium">
                {count} {count === 1 ? 'Draft' : 'Drafts'} to finish
            </span>
        </button>
    )
}
