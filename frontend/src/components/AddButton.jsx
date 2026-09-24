import { Plus } from 'lucide-react'
import Button from './Button'

// Shared "+ Add" CTA so Categories and Transactions stay visually
// consistent — same icon and label, each page wiring its own behavior
// (Categories: type="submit" on its inline form; Transactions: onClick to
// open the Add modal).
export default function AddButton({ children = 'Add', ...props }) {
    return (
        <Button {...props}>
            <Plus aria-hidden="true" strokeWidth={1.7} className="h-4 w-4 -ml-1 mr-1.5" />
            {children}
        </Button>
    )
}
