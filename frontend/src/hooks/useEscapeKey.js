import { useLayer } from '@hooks/useLayer'

// Calls `onEscape` when Escape is pressed and this is the top open layer,
// for layers that don't block the page (e.g. the desktop month popover).
// Modal and Sheet use useLayer's modal mode instead, via useDismiss. Pass
// isEnabled: false while the layer animates out, so Escape skips it.
// The latest `onEscape` is always used, so it doesn't need to be stable.
export function useEscapeKey(onEscape, isEnabled = true) {
    useLayer({ onEscape, isEnabled })
}
