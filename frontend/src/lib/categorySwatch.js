// The nine Category swatches (ADR0010). Full class strings, not built from
// a template — Tailwind only picks up classes it can find literally in
// source, so `bg-swatch-${name}/12` would silently produce nothing.
const TILE_CLASSES = {
    slate: 'bg-swatch-slate/12 text-swatch-slate',
    ochre: 'bg-swatch-ochre/12 text-swatch-ochre',
    moss: 'bg-swatch-moss/12 text-swatch-moss',
    clay: 'bg-swatch-clay/12 text-swatch-clay',
    plum: 'bg-swatch-plum/12 text-swatch-plum',
    teal: 'bg-swatch-teal/12 text-swatch-teal',
    tan: 'bg-swatch-tan/12 text-swatch-tan',
    olive: 'bg-swatch-olive/12 text-swatch-olive',
    rose: 'bg-swatch-rose/12 text-swatch-rose',
}

const SWATCH_NAMES = Object.keys(TILE_CLASSES)

// Deterministic by Category id, per ADR0010: stable across sessions/reloads
// (the same Category always gets the same tile colour) and doesn't shift
// around when the category list changes elsewhere. Not a real user-chosen
// colour — that's Sprint 3 (docs/backlog.md, "Category color/icon").
export function categoryTileClasses(id) {
    const index = Math.abs(Number(id)) % SWATCH_NAMES.length
    return TILE_CLASSES[SWATCH_NAMES[index]]
}
