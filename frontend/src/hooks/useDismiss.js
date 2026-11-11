import { useRef } from 'react'
import { useEscapeKey } from '@hooks/useEscapeKey'
import { useIsExiting } from '@hooks/useIsExiting'

// Shared close-request wiring for Modal and Sheet: Escape (when this is the
// top layer) or a mousedown outside `contentRef` calls onRequestClose. Both
// are ignored while the popup is animating out (ExitPresence).
//
// Attach `contentRef` to the panel and `handleBackdropMouseDown` to the
// backdrop.
export function useDismiss(onRequestClose) {
    const contentRef = useRef(null)
    const isExiting = useIsExiting()

    useEscapeKey(() => {
        if (!isExiting) onRequestClose()
    })

    function handleBackdropMouseDown(event) {
        if (isExiting) return
        if (contentRef.current && !contentRef.current.contains(event.target)) onRequestClose()
    }

    return { contentRef, isExiting, handleBackdropMouseDown }
}
