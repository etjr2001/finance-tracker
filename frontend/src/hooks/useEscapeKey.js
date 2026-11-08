import { useEffect, useRef } from 'react'

// Open layers (Modal, MonthPicker…), oldest first. Escape goes only to the
// newest, so a dialog stacked on a modal (e.g. "+ Add new category…" or
// the Favourites picker over the Transaction form) closes on its own instead of
// also closing, or asking to discard, the modal underneath.
//
// Order is by when each layer mounted. Layers opened together in one render
// would register child-first, but every stacked layer in the app opens on a
// later user action, after the one below it.
const layers = []

// One document listener for all layers, so exactly one handler runs per
// keypress, even if that handler closes its layer mid-event.
function handleKeyDown(event) {
    if (event.key === 'Escape') layers.at(-1)?.current()
}

// Calls `onEscape` when Escape is pressed and this is the top open layer.
// The latest `onEscape` is always used, so it doesn't need to be stable.
export function useEscapeKey(onEscape) {
    const handlerRef = useRef(onEscape)

    useEffect(() => {
        handlerRef.current = onEscape
    })

    useEffect(() => {
        if (layers.length === 0) document.addEventListener('keydown', handleKeyDown)
        layers.push(handlerRef)
        return () => {
            layers.splice(layers.indexOf(handlerRef), 1)
            if (layers.length === 0) document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])
}
