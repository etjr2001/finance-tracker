import { useEffect } from 'react'

// Calls `onEscape` when Escape is pressed anywhere in the document. Shared
// by every overlay (Modal, MonthPicker) so the listener/cleanup pattern
// lives in one place. Pass a stable callback to avoid re-subscribing.
export function useEscapeKey(onEscape) {
    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === 'Escape') onEscape()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onEscape])
}
