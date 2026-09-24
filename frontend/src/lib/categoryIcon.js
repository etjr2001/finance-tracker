import { UtensilsCrossed, ShoppingCart, Bus, Home, Wallet, Zap, Film, Tag } from 'lucide-react'

// Guesses an icon from a Category's name, purely as a frontend stopgap
// (ADR0010) until real per-Category icons exist (Sprint 3, docs/backlog.md
// — a user-chosen icon_key persisted on the Category). Keyword matching
// only, no fuzzy logic: an unrecognized name falls back to the shared
// default (Tag) rather than guessing wrong.
const KEYWORD_ICONS = [
    { keywords: ['food', 'dining', 'restaurant', 'eat'], icon: UtensilsCrossed },
    { keywords: ['groceries', 'grocery'], icon: ShoppingCart },
    { keywords: ['transport', 'transit', 'commute', 'travel'], icon: Bus },
    { keywords: ['rent', 'home', 'housing', 'mortgage'], icon: Home },
    { keywords: ['salary', 'income', 'wage', 'pay'], icon: Wallet },
    { keywords: ['utilities', 'utility', 'bill'], icon: Zap },
    { keywords: ['entertainment', 'movie', 'fun'], icon: Film },
]

export function categoryIcon(name) {
    const lower = (name ?? '').toLowerCase()
    const match = KEYWORD_ICONS.find(({ keywords }) => keywords.some((keyword) => lower.includes(keyword)))
    return match?.icon ?? Tag
}
