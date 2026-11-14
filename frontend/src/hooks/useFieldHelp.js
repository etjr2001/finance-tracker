import { useState } from 'react'

// Open/closed state for a field's (i) help, shared by FormField and
// AmountField. While open, `help` replaces the short `helper` under the
// control and the control is described by it.
// Spread `labelProps` into FieldLabel (empty without `help`, so no (i)),
// put `describedBy` on the control as aria-describedby, and render
// <FieldNote id={noteId}>{note}</FieldNote> under it.
export function useFieldHelp({ id, help, helper }) {
    const [isOpen, setIsOpen] = useState(false)
    const helpId = `${id}-help`
    const isShowingHelp = Boolean(help) && isOpen

    return {
        labelProps: help ? { helpId, isHelpOpen: isOpen, onToggleHelp: () => setIsOpen((open) => !open) } : {},
        describedBy: isShowingHelp ? helpId : undefined,
        note: isShowingHelp ? help : helper,
        noteId: isShowingHelp ? helpId : undefined,
    }
}
