// Shared sliding toggle: a capsule whose fill colour follows the selected
// option, with a white thumb that slides behind whichever label is active.
// `role` lets a caller pick the correct semantics — 'radiogroup' for a
// mutually-exclusive choice (e.g. transaction type), 'tablist' for a view
// switch (e.g. a future bar/pie toggle) — while the look stays identical.
// A click anywhere in the control advances to the next option (cycling back
// to the first after the last), rather than only the clicked option's own
// segment — the whole field acts as a single toggle, not n separate targets.
export function SegmentedControl({ options, value, onChange, role = 'radiogroup', ariaLabel, fillClassName, selectedTextClassName }) {
    const selectedIndex = Math.max(
        0,
        options.findIndex((option) => option.value === value)
    )
    const itemRole = role === 'radiogroup' ? 'radio' : 'tab'
    const optionCount = options.length

    function toggleToNext() {
        onChange(options[(selectedIndex + 1) % optionCount].value)
    }

    // The whole control is one toggle now (see the note above), so it's a
    // single tab stop rather than one per option, activated by click,
    // Enter or Space.
    function handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggleToNext()
        }
    }

    return (
        // h-11 (44px) on the container itself, matching Button's touch
        // target: the inner p-1 padding means the buttons must fill the
        // remaining height (not carry their own min-h-11), or the control
        // as a whole would be taller than every other button. rounded-xl
        // (not rounded-full) to match Button/FormField's 12px radius
        // (ADR0010: controls use a 12px radius).
        <div
            role={role}
            aria-label={ariaLabel}
            tabIndex={0}
            onClick={toggleToNext}
            onKeyDown={handleKeyDown}
            className={`relative inline-flex h-11 cursor-pointer select-none rounded-xl p-1 transition-colors motion-reduce:transition-none focus:outline-none focus:ring-1 focus:ring-ink ${fillClassName}`}
        >
            <span
                aria-hidden="true"
                className="absolute inset-y-1 rounded-lg bg-paper transition-[left] motion-reduce:transition-none"
                style={{
                    // `left`/`width` percentages resolve against the
                    // container (the containing block), unlike a
                    // `transform: translateX(%)`, which resolves against the
                    // thumb's own box — using transform here previously threw
                    // the slide distance off by the width of the 4px inset.
                    left: `calc(${selectedIndex} / ${optionCount} * 100% + 4px)`,
                    width: `calc(100% / ${optionCount} - 8px)`,
                }}
            />
            {options.map((option) => {
                const isSelected = option.value === value
                return (
                    <span
                        key={option.value}
                        role={itemRole}
                        aria-checked={role === 'radiogroup' ? isSelected : undefined}
                        aria-selected={role === 'tablist' ? isSelected : undefined}
                        className={`relative z-10 flex flex-1 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors motion-reduce:transition-none ${
                            isSelected ? selectedTextClassName : 'text-paper'
                        }`}
                    >
                        {option.label}
                    </span>
                )
            })}
        </div>
    )
}
