import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom doesn't implement matchMedia. Default to "matches" (desktop) for
// any query — jsdom's own default viewport is 1024px wide, so this is the
// faithful default, and it means every existing test (none of which touch
// viewport width) keeps working unchanged. Tests that need "mobile"
// override window.matchMedia themselves for their own scope.
if (typeof window !== 'undefined' && !window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }))
}
