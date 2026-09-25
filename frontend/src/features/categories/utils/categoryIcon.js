import {
    UtensilsCrossed,
    ShoppingCart,
    Bus,
    Car,
    Home,
    FileText,
    Shield,
    Repeat,
    ShoppingBag,
    Coffee,
    Gift,
    Heart,
    Plane,
    Ticket,
    ArrowLeftRight,
    Briefcase,
    Smartphone,
    Wallet,
    Zap,
    Film,
    Tag,
} from 'lucide-react'

// The curated icon_key registry (docs/backlog.md, "Category color/icon").
// Each icon is imported explicitly by name (ADR0010), never looked up by
// name at runtime, so tree-shaking works. Adding an icon here is a
// frontend-only change — the backend only validates icon_key's format,
// not against this list.
const ICONS = {
    'utensils-crossed': UtensilsCrossed,
    'shopping-cart': ShoppingCart,
    bus: Bus,
    car: Car,
    home: Home,
    'file-text': FileText,
    shield: Shield,
    repeat: Repeat,
    'shopping-bag': ShoppingBag,
    coffee: Coffee,
    gift: Gift,
    heart: Heart,
    plane: Plane,
    ticket: Ticket,
    'arrow-left-right': ArrowLeftRight,
    briefcase: Briefcase,
    smartphone: Smartphone,
    wallet: Wallet,
    zap: Zap,
    film: Film,
    tag: Tag,
}

// Display order for the icon picker grid.
export const ICON_KEYS = Object.keys(ICONS)

const DEFAULT_ICON_KEY = 'tag'

// A real per-Category icon_key, once chosen, always wins. Unknown or
// missing keys fall back to this one fixed default (docs/backlog.md) —
// not a name-based guess, now that icon is a real, user-owned choice.
export function categoryIcon(iconKey) {
    return ICONS[iconKey] ?? ICONS[DEFAULT_ICON_KEY]
}

// Keyword matching only, no fuzzy logic, used once: to pre-fill icon_key
// when a Category is created from the Categories page (fewest-click
// creation) — never as an ongoing render-time fallback. No match returns
// null, so the Category is created with icon_key unset (categoryIcon's
// default) rather than a wrong guess.
const KEYWORD_ICON_KEYS = [
    { keywords: ['food', 'dining', 'restaurant', 'eat'], key: 'utensils-crossed' },
    { keywords: ['groceries', 'grocery'], key: 'shopping-cart' },
    { keywords: ['transport', 'transit', 'commute', 'travel'], key: 'bus' },
    { keywords: ['rent', 'home', 'housing', 'mortgage'], key: 'home' },
    { keywords: ['salary', 'income', 'wage', 'pay'], key: 'wallet' },
    { keywords: ['utilities', 'utility', 'bill'], key: 'zap' },
    { keywords: ['entertainment', 'movie', 'fun'], key: 'film' },
]

export function guessIconKey(name) {
    const lower = (name ?? '').toLowerCase()
    const match = KEYWORD_ICON_KEYS.find(({ keywords }) => keywords.some((keyword) => lower.includes(keyword)))
    return match?.key ?? null
}
