import { useEffect, useRef, useState } from 'react'
import { useEscapeKey } from '@hooks/useEscapeKey'
import { useIsMobile } from '@hooks/useIsMobile'

// How far (px) a downward swipe must travel before letting go closes it.
const SWIPE_CLOSE_DISTANCE = 80
// Slide-down on close; matches the slide-up (--animate-sheet-up, index.css).
export const SHEET_EXIT_MS = 200
// Drags that start on these stay clicks/typing, not swipes.
const INTERACTIVE = 'button, a, input, select, textarea'

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Below md: a bottom sheet that slides up, with a drag handle; slides back
// down when closed by a swipe down, a tap on the dimmed background, or
// Escape. md:+: the same content as a centred modal, like Modal, closing
// instantly (as it also does under reduced motion).
//
// Closing *is* closing: after the slide-down it calls onRequestClose. Pass
// children as a function to get `close(then)` for buttons inside the sheet:
// it slides down, then runs `then` (default onRequestClose). Use it for
// actions that just dismiss the sheet; actions that open another dialog
// straight away can skip it.
//
// For short content: the mobile panel takes over touch gestures (touch-none)
// so a swipe moves the sheet, not the page behind it, which also means it
// doesn't scroll.
export function Sheet({ onRequestClose, children }) {
    const isMobile = useIsMobile()
    const panelRef = useRef(null)
    // null when not dragging; otherwise where the swipe started.
    const [dragStartY, setDragStartY] = useState(null)
    const [dragOffset, setDragOffset] = useState(0)
    // null until a close starts; then { then }, what to run after the slide.
    const [pendingClose, setPendingClose] = useState(null)
    const isClosing = pendingClose !== null
    const isDragging = dragStartY !== null

    // Runs the close once the slide-down has played; cleared on unmount.
    useEffect(() => {
        if (!pendingClose) return
        const timer = setTimeout(pendingClose.then, SHEET_EXIT_MS)
        return () => clearTimeout(timer)
    }, [pendingClose])

    function close(then = onRequestClose) {
        if (isClosing) return
        if (!isMobile || prefersReducedMotion()) {
            then()
            return
        }
        setPendingClose({ then })
    }

    useEscapeKey(() => close())

    function handleBackdropMouseDown(event) {
        if (panelRef.current && !panelRef.current.contains(event.target)) close()
    }

    function handlePointerDown(event) {
        if (!isMobile || isClosing || event.target.closest(INTERACTIVE)) return
        setDragStartY(event.clientY)
        event.currentTarget.setPointerCapture?.(event.pointerId)
    }

    function handlePointerMove(event) {
        if (!isDragging) return
        // Only downwards: pulling up past the resting position does nothing.
        setDragOffset(Math.max(0, event.clientY - dragStartY))
    }

    function handlePointerEnd() {
        if (!isDragging) return
        const shouldClose = dragOffset > SWIPE_CLOSE_DISTANCE
        setDragStartY(null)
        // When closing, the slide-down carries on from where the finger let go.
        if (shouldClose) close()
        else setDragOffset(0)
    }

    let transform
    if (isClosing) transform = 'translateY(100%)'
    else if (dragOffset) transform = `translateY(${dragOffset}px)`

    let transition = 'transform 150ms ease-out'
    if (isDragging) transition = 'none'
    else if (isClosing) transition = `transform ${SHEET_EXIT_MS}ms ease-in`

    // Same backdrop as Modal: neutral black, shadow only on the floating
    // layer (ADR0010); it fades out with the slide-down. Safe-area padding
    // keeps the bottom actions clear of the iPhone home indicator.
    return (
        <div
            className={`fixed inset-0 z-50 flex items-end justify-center transition-colors md:items-center md:p-4 ${
                isClosing ? 'bg-black/0' : 'bg-black/45'
            }`}
            style={{ transitionDuration: `${SHEET_EXIT_MS}ms` }}
            onMouseDown={handleBackdropMouseDown}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                style={{ transform, transition }}
                className="w-full bg-paper-raised shadow-xl rounded-t-[14px] px-6 pt-2 pb-[calc(1.5rem+env(safe-area-inset-bottom))] touch-none motion-safe:animate-sheet-up md:max-w-md md:rounded-[14px] md:p-6 md:touch-auto md:animate-none"
            >
                <div aria-hidden="true" className="mx-auto mb-3 h-1 w-10 rounded-full bg-rule md:hidden" />
                {typeof children === 'function' ? children({ close }) : children}
            </div>
        </div>
    )
}
