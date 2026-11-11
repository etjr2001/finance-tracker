import { useState } from 'react'
import { useDismiss } from '@hooks/useDismiss'
import { useIsMobile } from '@hooks/useIsMobile'
import { EXIT_MS } from '@hooks/useIsExiting'

// How far (px) a downward swipe must travel before letting go closes it.
const SWIPE_CLOSE_DISTANCE = 80
// Drags that start on these stay clicks/typing, not swipes.
const INTERACTIVE = 'button, a, input, select, textarea'

// Below md: a bottom sheet that slides up, with a drag handle; closes on a
// swipe down, a tap on the dimmed background, or Escape. md:+: the same
// content as a centred modal that pops in, like Modal. Like Modal it only
// reports a close *request*; the caller decides what closing means.
//
// Rendered inside ExitPresence it also animates out: slides back down on
// mobile (from wherever a swipe let go), pops out on desktop, ignoring
// input while it does.
//
// For short content: the mobile panel takes over touch gestures (touch-none)
// so a swipe moves the sheet, not the page behind it, which also means it
// doesn't scroll.
export function Sheet({ onRequestClose, children }) {
    const isMobile = useIsMobile()
    const { contentRef: panelRef, isExiting, handleBackdropMouseDown } = useDismiss(onRequestClose)
    // null when not dragging; otherwise where the swipe started.
    const [dragStartY, setDragStartY] = useState(null)
    const [dragOffset, setDragOffset] = useState(0)
    const isDragging = dragStartY !== null

    function handlePointerDown(event) {
        if (!isMobile || isExiting || event.target.closest(INTERACTIVE)) return
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
        // When closing, keep the offset: the exit slide carries on from
        // where the finger let go.
        if (shouldClose) onRequestClose()
        else setDragOffset(0)
    }

    const isSlidingOut = isExiting && isMobile

    let transform
    if (isSlidingOut) transform = 'translateY(100%)'
    else if (dragOffset) transform = `translateY(${dragOffset}px)`

    let transition = 'transform 150ms ease-out'
    if (isDragging) transition = 'none'
    else if (isSlidingOut) transition = `transform ${EXIT_MS}ms ease-in`

    const panelAnimation = isExiting
        ? isMobile
            ? ''
            : 'animate-pop-out'
        : 'motion-safe:animate-sheet-up md:motion-safe:animate-pop-in'

    // Same backdrop as Modal: neutral black, shadow only on the floating
    // layer (ADR0010). Safe-area padding keeps the bottom actions clear of
    // the iPhone home indicator.
    return (
        <div
            className={`fixed inset-0 z-50 flex items-end justify-center bg-black/45 md:items-center md:p-4 ${
                isExiting ? 'animate-fade-out pointer-events-none' : 'motion-safe:animate-fade-in'
            }`}
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
                className={`w-full bg-paper-raised shadow-xl rounded-t-[14px] px-6 pt-2 pb-[calc(1.5rem+env(safe-area-inset-bottom))] touch-none md:max-w-md md:rounded-[14px] md:p-6 md:touch-auto ${panelAnimation}`}
            >
                <div aria-hidden="true" className="mx-auto mb-3 h-1 w-10 rounded-full bg-rule md:hidden" />
                {children}
            </div>
        </div>
    )
}
