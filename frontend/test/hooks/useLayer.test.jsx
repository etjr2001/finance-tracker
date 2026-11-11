import { describe, it, expect, vi, afterEach } from 'vitest'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useLayer } from '@hooks/useLayer'

function pressEscape() {
    act(() => {
        fireEvent.keyDown(document, { key: 'Escape' })
    })
}

// A minimal modal layer: portalled into <body> like Modal and Sheet.
function ModalLayer({ name, onEscape = () => {}, isEnabled = true, children }) {
    const elementRef = useRef(null)
    const focusRef = useRef(null)
    useLayer({ onEscape, isEnabled, isModal: true, elementRef, focusRef })
    return createPortal(
        <div ref={elementRef} data-testid={`${name}-layer`}>
            <div ref={focusRef} tabIndex={-1} data-testid={`${name}-panel`}>
                {children}
            </div>
        </div>,
        document.body
    )
}

// A non-modal layer (like the desktop month popover): Escape only.
function PopoverLayer({ onEscape }) {
    useLayer({ onEscape })
    return <div>popover</div>
}

// The page and a button that opens a modal layer, like an Add button.
function Page({ renderLayer }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div data-testid="page">
            <button onClick={() => setIsOpen(true)}>Open</button>
            {isOpen && renderLayer(() => setIsOpen(false))}
        </div>
    )
}

function pageRoot() {
    // render() mounts into its own div directly under <body>.
    return screen.getByTestId('page').parentElement
}

describe('useLayer', () => {
    afterEach(() => {
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
    })

    describe('Escape', () => {
        it('goes only to the newest open layer', () => {
            const onOuter = vi.fn()
            const onInner = vi.fn()
            const { rerender } = render(<PopoverLayer onEscape={onOuter} />)
            rerender(
                <>
                    <PopoverLayer onEscape={onOuter} />
                    <ModalLayer name="inner" onEscape={onInner} />
                </>
            )

            pressEscape()

            expect(onInner).toHaveBeenCalledTimes(1)
            expect(onOuter).not.toHaveBeenCalled()
        })

        // A closing popup lingers while it animates out (ExitPresence); a
        // quick second Escape must reach the layer below, not the closing one.
        it('skips a disabled (exiting) layer and reaches the one below', () => {
            const onOuter = vi.fn()
            const onInner = vi.fn()
            const { rerender } = render(<ModalLayer name="outer" onEscape={onOuter} />)
            rerender(
                <>
                    <ModalLayer name="outer" onEscape={onOuter} />
                    <ModalLayer name="inner" onEscape={onInner} />
                </>
            )
            rerender(
                <>
                    <ModalLayer name="outer" onEscape={onOuter} />
                    <ModalLayer name="inner" onEscape={onInner} isEnabled={false} />
                </>
            )

            pressEscape()

            expect(onInner).not.toHaveBeenCalled()
            expect(onOuter).toHaveBeenCalledTimes(1)
        })

        it('stops listening once unmounted', () => {
            const onEscape = vi.fn()
            const { unmount } = render(<PopoverLayer onEscape={onEscape} />)

            unmount()
            pressEscape()

            expect(onEscape).not.toHaveBeenCalled()
        })
    })

    describe('modal layers', () => {
        it('makes the page behind inert while open, and restores it on close', () => {
            render(<Page renderLayer={(close) => <ModalLayer name="dialog" onEscape={close} />} />)
            const root = pageRoot()

            fireEvent.click(screen.getByText('Open'))
            expect(root).toHaveAttribute('inert')
            expect(screen.getByTestId('dialog-layer')).not.toHaveAttribute('inert')

            pressEscape()
            expect(root).not.toHaveAttribute('inert')
        })

        it('makes a modal below a stacked one inert too, until the top one closes', () => {
            function Stack() {
                const [isInnerOpen, setIsInnerOpen] = useState(false)
                return (
                    <ModalLayer name="outer">
                        <button onClick={() => setIsInnerOpen(true)}>Open inner</button>
                        {isInnerOpen && <ModalLayer name="inner" onEscape={() => setIsInnerOpen(false)} />}
                    </ModalLayer>
                )
            }
            render(<Stack />)

            fireEvent.click(screen.getByText('Open inner'))
            expect(screen.getByTestId('outer-layer')).toHaveAttribute('inert')
            expect(screen.getByTestId('inner-layer')).not.toHaveAttribute('inert')

            pressEscape()
            expect(screen.getByTestId('outer-layer')).not.toHaveAttribute('inert')
        })

        it('leaves inert alone on elements it did not set it on', () => {
            const other = document.createElement('div')
            other.setAttribute('inert', '')
            document.body.appendChild(other)
            render(<Page renderLayer={(close) => <ModalLayer name="dialog" onEscape={close} />} />)

            fireEvent.click(screen.getByText('Open'))
            pressEscape()

            expect(other).toHaveAttribute('inert')
            other.remove()
        })

        it('locks page scroll while any modal is open, counting stacked ones', () => {
            function Stack() {
                const [isInnerOpen, setIsInnerOpen] = useState(false)
                return (
                    <Page
                        renderLayer={(close) => (
                            <ModalLayer name="outer" onEscape={close}>
                                <button onClick={() => setIsInnerOpen(true)}>Open inner</button>
                                {isInnerOpen && <ModalLayer name="inner" onEscape={() => setIsInnerOpen(false)} />}
                            </ModalLayer>
                        )}
                    />
                )
            }
            render(<Stack />)

            fireEvent.click(screen.getByText('Open'))
            expect(document.documentElement.style.overflow).toBe('hidden')
            expect(document.body.style.overflow).toBe('hidden')

            fireEvent.click(screen.getByText('Open inner'))
            pressEscape() // closes inner; outer still open
            expect(document.body.style.overflow).toBe('hidden')

            pressEscape() // closes outer
            expect(document.documentElement.style.overflow).toBe('')
            expect(document.body.style.overflow).toBe('')
        })

        it('moves focus into the layer on open and back to the opener on close', () => {
            render(<Page renderLayer={(close) => <ModalLayer name="dialog" onEscape={close} />} />)
            const opener = screen.getByText('Open')
            opener.focus()

            fireEvent.click(opener)
            expect(screen.getByTestId('dialog-panel')).toHaveFocus()

            pressEscape()
            expect(opener).toHaveFocus()
        })

        it('keeps focus on an autofocused field inside the layer', () => {
            render(
                <Page
                    renderLayer={(close) => (
                        <ModalLayer name="dialog" onEscape={close}>
                            <input aria-label="Name" autoFocus />
                        </ModalLayer>
                    )}
                />
            )

            fireEvent.click(screen.getByText('Open'))

            expect(screen.getByLabelText('Name')).toHaveFocus()
        })

        it('releases inert, scroll and focus as soon as it is disabled (exiting), before unmounting', () => {
            function Exiting() {
                const [isEnabled, setIsEnabled] = useState(true)
                return (
                    <>
                        <button onClick={() => setIsEnabled(false)}>Start exit</button>
                        <ModalLayer name="dialog" isEnabled={isEnabled} />
                    </>
                )
            }
            render(<Exiting />)
            const root = screen.getByText('Start exit').parentElement

            // The page is inert, so press the button directly.
            act(() => screen.getByText('Start exit').click())

            expect(root).not.toHaveAttribute('inert')
            expect(document.body.style.overflow).toBe('')
        })
    })

    describe('non-modal layers', () => {
        it('neither makes the page inert nor locks scroll', () => {
            render(
                <Page
                    renderLayer={(close) => <PopoverLayer onEscape={close} />}
                />
            )
            const root = pageRoot()

            fireEvent.click(screen.getByText('Open'))

            expect(root).not.toHaveAttribute('inert')
            expect(document.body.style.overflow).toBe('')
        })
    })
})
