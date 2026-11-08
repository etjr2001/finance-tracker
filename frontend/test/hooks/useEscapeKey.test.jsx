import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useEscapeKey } from '@hooks/useEscapeKey'

function Layer({ onEscape, children }) {
    useEscapeKey(onEscape)
    return <div>{children}</div>
}

function pressEscape() {
    fireEvent.keyDown(document, { key: 'Escape' })
}

describe('useEscapeKey', () => {
    it('calls the handler on Escape and ignores other keys', () => {
        const onEscape = vi.fn()
        render(<Layer onEscape={onEscape} />)

        fireEvent.keyDown(document, { key: 'Enter' })
        expect(onEscape).not.toHaveBeenCalled()

        pressEscape()
        expect(onEscape).toHaveBeenCalledTimes(1)
    })

    it('only calls the most recently opened layer when layers are stacked', () => {
        const onOuter = vi.fn()
        const onInner = vi.fn()
        const { rerender } = render(<Layer onEscape={onOuter} />)
        rerender(
            <Layer onEscape={onOuter}>
                <Layer onEscape={onInner} />
            </Layer>
        )

        pressEscape()

        expect(onInner).toHaveBeenCalledTimes(1)
        expect(onOuter).not.toHaveBeenCalled()
    })

    it('hands Escape back to the layer below once the top one closes itself', () => {
        const onOuter = vi.fn()

        function Stack() {
            const [isInnerOpen, setIsInnerOpen] = useState(false)
            return (
                <Layer onEscape={onOuter}>
                    <button onClick={() => setIsInnerOpen(true)}>open inner</button>
                    {isInnerOpen && <Layer onEscape={() => setIsInnerOpen(false)}>inner</Layer>}
                </Layer>
            )
        }
        render(<Stack />)
        // Opened after the outer layer, as every dialog in the app is.
        fireEvent.click(screen.getByText('open inner'))

        act(() => pressEscape())
        expect(screen.queryByText('inner')).not.toBeInTheDocument()
        expect(onOuter).not.toHaveBeenCalled()

        act(() => pressEscape())
        expect(onOuter).toHaveBeenCalledTimes(1)
    })

    it('uses the latest handler without needing a stable callback', () => {
        const first = vi.fn()
        const second = vi.fn()
        const { rerender } = render(<Layer onEscape={first} />)
        rerender(<Layer onEscape={second} />)

        pressEscape()

        expect(first).not.toHaveBeenCalled()
        expect(second).toHaveBeenCalledTimes(1)
    })

    it('stops listening once unmounted', () => {
        const onEscape = vi.fn()
        const { unmount } = render(<Layer onEscape={onEscape} />)

        unmount()
        pressEscape()

        expect(onEscape).not.toHaveBeenCalled()
    })
})
