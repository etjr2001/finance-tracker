// Shared text-input styling. Lives outside FormField.jsx so that file only
// exports components (keeps React Fast Refresh working).
// h-11 (44px, matching Button's touch target) rather than padding-derived
// height: WebKit's native date input computes its own height from its
// internal fields, not from padding, so a fixed height is what keeps it the
// same size as the other fields and buttons on iOS Safari (fix/date-field-ios).
export const inputClass =
    'w-full h-11 border border-rule-strong bg-white px-3 rounded-xl text-base focus:outline-none focus:ring-1 focus:ring-ink'

export const nativeSelectResetClass = 'appearance-none [-webkit-appearance:none] [-moz-appearance:none]'
