import { useDismiss } from '@hooks/useDismiss'

// Generic modal shell. It never decides whether closing is safe — it only
// reports a close *request* (outside click or Escape) via onRequestClose,
// and the caller decides whether to close silently or confirm first.
//
// Fades and pops in on open. Rendered inside ExitPresence it also animates
// out, ignoring clicks and Escape while it does.
export function Modal({ onRequestClose, children, contentClassName = 'max-w-md' }) {
    const { contentRef, isExiting, handleBackdropMouseDown } = useDismiss(onRequestClose)

    // Neutral black backdrop, not bg-ink/40: ink's green cast reads as a
    // murky olive tint at low opacity. Shadow only on floating layers (ADR0010).
    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 ${
                isExiting ? 'animate-fade-out pointer-events-none' : 'motion-safe:animate-fade-in'
            }`}
            onMouseDown={handleBackdropMouseDown}
        >
            <div
                ref={contentRef}
                role="dialog"
                aria-modal="true"
                className={`w-full ${contentClassName} rounded-[14px] bg-paper-raised p-6 shadow-xl ${
                    isExiting ? 'animate-pop-out' : 'motion-safe:animate-pop-in'
                }`}
            >
                {children}
            </div>
        </div>
    )
}
