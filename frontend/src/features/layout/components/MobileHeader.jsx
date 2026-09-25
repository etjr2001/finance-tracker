import { LogOut } from 'lucide-react'
import { IconButton } from '@components/IconButton'

// Below md: nav lives in the bottom tab bar, so the header is just the
// title and an icon-only Log out / Exit demo button (ADR0010).
export function MobileHeader({ exitLabel, onExit }) {
    return (
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-rule bg-paper-raised">
            <h1 className="font-serif font-semibold text-xl">Ledger</h1>
            <IconButton icon={LogOut} label={exitLabel} onClick={onExit} iconSize="h-5 w-5" className="-mr-2" />
        </div>
    )
}
