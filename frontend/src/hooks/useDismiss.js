import { useRef } from 'react'
import { useLayer } from '@hooks/useLayer'
import { useIsExiting } from '@hooks/useIsExiting'

// Shared wiring for Modal and Sheet, which portal into <body>:
// - a modal layer (useLayer): the page behind is inert and doesn't
//   scroll, focus moves into `contentRef` and back to the opener on close.
//   Released as soon as the popup starts animating out (ExitPresence).
// - Escape (when this is the top layer) or a mousedown on the backdrop
//   itself calls onRequestClose. Both are ignored while exiting.
//
// "On the backdrop itself", not "outside the panel": React events bubble
// through portals, so a mousedown on a dialog stacked over this one would
// otherwise also count as an outside click here.
//
// Attach `backdropRef` and `handleBackdropMouseDown` to the backdrop, and
// `contentRef` to the panel (with tabIndex={-1} so it can take focus).
export function useDismiss(onRequestClose) {
    const backdropRef = useRef(null)
    const contentRef = useRef(null)
    const isExiting = useIsExiting()

    useLayer({
        onEscape: onRequestClose,
        isEnabled: !isExiting,
        isModal: true,
        elementRef: backdropRef,
        focusRef: contentRef,
    })

    function handleBackdropMouseDown(event) {
        if (isExiting) return
        if (event.target === event.currentTarget) onRequestClose()
    }

    return { backdropRef, contentRef, isExiting, handleBackdropMouseDown }
}
