import { createPortal } from 'react-dom'
import { useDismiss } from '@hooks/useDismiss'

// Generic modal shell. It never decides whether closing is safe — it only
// reports a close *request* (backdrop click or Escape) via onRequestClose,
// and the caller decides whether to close silently or confirm first.
//
// Rendered into <body>, outside the app root, which is inert while it's
// open (useDismiss): the page behind can't be tabbed to, read by a screen
// reader, or scrolled. Focus moves into the dialog and back on close.
//
// Fades and pops in on open. Rendered inside ExitPresence it also animates
// out, ignoring clicks and Escape while it does. Under reduced motion the
// pop (a zoom) becomes a plain fade; the backdrop fades either way.
export function Modal({ onRequestClose, children, contentClassName = 'max-w-md' }) {
    const { backdropRef, contentRef, isExiting, handleBackdropMouseDown } = useDismiss(onRequestClose)

    // Neutral black backdrop, not bg-ink/40: ink's green cast reads as a
    // murky olive tint at low opacity. Shadow only on floating layers (ADR0010).
    return createPortal(
        <div
            ref={backdropRef}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 ${
                isExiting ? 'animate-fade-out pointer-events-none' : 'animate-fade-in'
            }`}
            onMouseDown={handleBackdropMouseDown}
        >
            <div
                ref={contentRef}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                className={`w-full ${contentClassName} rounded-[14px] bg-paper-raised p-6 shadow-xl outline-none ${
                    isExiting
                        ? 'motion-safe:animate-pop-out motion-reduce:animate-fade-out'
                        : 'motion-safe:animate-pop-in motion-reduce:animate-fade-in'
                }`}
            >
                {children}
            </div>
        </div>,
        document.body
    )
}
