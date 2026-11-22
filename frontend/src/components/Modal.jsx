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
//
// Never taller than the screen: the dialog is capped at the backdrop's
// height (the viewport minus its padding, which also clears any safe-area
// inset), and the body scrolls inside it. An optional footer (e.g. Save /
// Cancel) stays pinned below the body, so it's always reachable on a small
// phone. The body is a flex column, so content can pin its own header and
// scroll just a list (min-h-0 + overflow-y-auto on the list).
export function Modal({ onRequestClose, children, footer, contentClassName = 'max-w-md' }) {
    const { backdropRef, contentRef, isExiting, handleBackdropMouseDown } = useDismiss(onRequestClose)

    // Neutral black backdrop, not bg-ink/40: ink's green cast reads as a
    // murky olive tint at low opacity. Shadow only on floating layers (ADR0010).
    return createPortal(
        <div
            ref={backdropRef}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/45 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] ${
                isExiting ? 'animate-fade-out pointer-events-none' : 'animate-fade-in'
            }`}
            onMouseDown={handleBackdropMouseDown}
        >
            <div
                ref={contentRef}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                className={`flex max-h-full w-full flex-col overflow-hidden ${contentClassName} rounded-[14px] bg-paper-raised shadow-xl outline-none ${
                    isExiting
                        ? 'motion-safe:animate-pop-out motion-reduce:animate-fade-out'
                        : 'motion-safe:animate-pop-in motion-reduce:animate-fade-in'
                }`}
            >
                <div className="flex min-h-0 flex-auto flex-col overflow-y-auto overscroll-contain p-6">
                    {children}
                </div>
                {footer && (
                    <div className="shrink-0 border-t border-rule px-6 pt-4 pb-6">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
