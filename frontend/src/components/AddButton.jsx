import { Plus } from 'lucide-react'
import { Button } from '@components/Button'

// Shared "+ Add" CTA so every add action looks identical; each caller
// wires its own behavior (submit vs. onClick) via forwarded Button props.
export function AddButton({ children = 'Add', ...buttonProps }) {
    return (
        <Button {...buttonProps}>
            <Plus aria-hidden="true" strokeWidth={1.7} className="h-4 w-4 -ml-1 mr-1.5" />
            {children}
        </Button>
    )
}
