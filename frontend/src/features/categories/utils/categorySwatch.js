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

// Solid fill, for the Dashboard category breakdown bars — same swatch as
// the tile above, just without the 12%-opacity tint.
const BAR_CLASSES = {
    slate: 'bg-swatch-slate',
    ochre: 'bg-swatch-ochre',
    moss: 'bg-swatch-moss',
    clay: 'bg-swatch-clay',
    plum: 'bg-swatch-plum',
    teal: 'bg-swatch-teal',
    tan: 'bg-swatch-tan',
    olive: 'bg-swatch-olive',
    rose: 'bg-swatch-rose',
}

// The 9 keys a User picks from (docs/backlog.md, "Category color/icon"),
// in swatch-picker display order.
export const COLOR_KEYS = Object.keys(TILE_CLASSES)

const DEFAULT_COLOR_KEY = 'slate'

// A real per-Category colour_key, once chosen, always wins. A category
// with none yet (colour_key is null — never persisted, or created before
// this existed) falls back to one fixed default rather than the old
// deterministic-by-id guess: once colour is a real, user-owned choice,
// guessing one is more misleading than a plain, honest default.
export function categoryTileClasses(colorKey) {
    return TILE_CLASSES[colorKey] ?? TILE_CLASSES[DEFAULT_COLOR_KEY]
}

export function categoryBarClass(colorKey) {
    return BAR_CLASSES[colorKey] ?? BAR_CLASSES[DEFAULT_COLOR_KEY]
}

// Deterministic by name (not id — a new Category has no id yet at the
// point NewCategoryForm needs to assign one), for the "fewest click"
// auto-assign on create. Two different names can collide once there are
// more Categories than swatches; that's fine, same as the old by-id
// scheme — it's a starting point, not an identity, and stays editable.
export function assignColorKey(name) {
    let hash = 0
    for (const char of name ?? '') {
        hash = (hash * 31 + char.charCodeAt(0)) | 0
    }
    return COLOR_KEYS[Math.abs(hash) % COLOR_KEYS.length]
}
