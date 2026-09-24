import { useEffect, useRef } from 'react'

// Generic modal shell. Does NOT decide whether it's safe to close — it just
// reports a close *request* (outside click or Escape) via onRequestClose.
// The caller decides whether that should be silent or gated behind a confirm
// (e.g. based on a form's dirty state).
export default function Modal({ onRequestClose, children, contentClassName = 'max-w-md' }) {
    const contentRef = useRef(null)

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape') onRequestClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onRequestClose])

    function handleBackdropMouseDown(e) {
        if (contentRef.current && !contentRef.current.contains(e.target)) {
            onRequestClose()
        }
    }

    return (
        <div
            // A true neutral black, not bg-ink/40 — ink has a deliberate
            // green cast (right for text) that reads as a murky olive tint
            // once spread across the whole backdrop at low opacity.
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
            onMouseDown={handleBackdropMouseDown}
        >
            {/* Shadow here, not on in-page Cards — ADR0010 reserves shadows
                for floating layers, and a modal is exactly that. */}
            <div ref={contentRef} className={`w-full ${contentClassName} rounded-[14px] bg-paper-raised p-6 shadow-xl`}>
                {children}
            </div>
        </div>
    )
}