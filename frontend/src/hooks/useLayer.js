import { useEffect, useRef, useState } from 'react'

// Open layers (Modal, Sheet, the month popover…), oldest first.
//
// Escape goes only to the newest, so a dialog stacked on a modal (e.g.
// "+ Add new category…" or the Favourites picker over the Transaction form)
// closes on its own instead of also closing, or asking to discard, the
// modal underneath. A layer that is animating out passes isEnabled: false
// and leaves the stack straight away, so a quick second Escape reaches the
// layer below it.
//
// Modal layers (isModal) also block the page behind them:
// - every other child of <body> gets `inert` (the app root, and any modal
//   below the newest one), so Tab, screen readers and clicks can't reach
//   it. Modal and Sheet portal into <body> so they sit outside the app root.
// - the page stops scrolling (overflow: hidden on <html> and <body>) while
//   any modal layer is open, counted, so closing a stacked one doesn't
//   unlock it.
// - focus moves into the layer on open (unless something inside, like an
//   autoFocus field, already has it) and goes back to whatever had it
//   before, on close.
//
// Order is by when each layer opened. Layers opened together in one render
// would register child-first, but every stacked layer in the app opens on a
// later user action, after the one below it.
const layers = []

// Elements this module made inert, so it only ever removes its own.
const inertedByUs = new Set()
// The page's own overflow values while scroll is locked, else null.
let savedOverflow = null

// One document listener for all layers, so exactly one handler runs per
// keypress, even if that handler closes its layer mid-event.
function handleKeyDown(event) {
    if (event.key === 'Escape') layers.at(-1)?.handlerRef.current()
}

function syncModalState() {
    const topModal = layers.findLast((layer) => layer.isModal && layer.elementRef?.current)?.elementRef.current

    const shouldBeInert = new Set()
    if (topModal) {
        for (const child of document.body.children) {
            if (child !== topModal) shouldBeInert.add(child)
        }
    }
    for (const element of inertedByUs) {
        if (!shouldBeInert.has(element)) {
            element.removeAttribute('inert')
            inertedByUs.delete(element)
        }
    }
    for (const element of shouldBeInert) {
        if (!element.hasAttribute('inert')) {
            element.setAttribute('inert', '')
            inertedByUs.add(element)
        }
    }

    const html = document.documentElement
    const { body } = document
    if (topModal && savedOverflow === null) {
        savedOverflow = { html: html.style.overflow, body: body.style.overflow }
        html.style.overflow = 'hidden'
        body.style.overflow = 'hidden'
    } else if (!topModal && savedOverflow !== null) {
        html.style.overflow = savedOverflow.html
        body.style.overflow = savedOverflow.body
        savedOverflow = null
    }
}

// Back to whatever had focus before the layer opened, if it's still on the
// page (e.g. not a row that was just deleted).
function returnFocus(opener) {
    if (opener instanceof HTMLElement && opener !== document.body && opener.isConnected) {
        opener.focus({ preventScroll: true })
    }
}

// `elementRef`: the layer's outermost element, a direct child of <body>
// (modal layers only). `focusRef`: where focus goes on open, e.g. the
// dialog panel with tabIndex={-1}.
export function useLayer({ onEscape, isEnabled = true, isModal = false, elementRef, focusRef }) {
    const handlerRef = useRef(onEscape)
    // Read on the first render, before the layer commits: an autoFocus
    // field inside it takes focus during commit, before effects run.
    const [opener] = useState(() => (isModal ? document.activeElement : null))

    useEffect(() => {
        handlerRef.current = onEscape
    })

    useEffect(() => {
        if (!isEnabled) return
        const layer = { handlerRef, isModal, elementRef }
        if (layers.length === 0) document.addEventListener('keydown', handleKeyDown)
        layers.push(layer)

        if (isModal) {
            syncModalState()
            const target = focusRef?.current
            if (target && !target.contains(document.activeElement)) target.focus({ preventScroll: true })
        }

        return () => {
            layers.splice(layers.indexOf(layer), 1)
            if (layers.length === 0) document.removeEventListener('keydown', handleKeyDown)

            if (isModal) {
                syncModalState()
                returnFocus(opener)
            }
        }
    }, [isEnabled, isModal, elementRef, focusRef, opener])
}
