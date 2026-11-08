import { toDemoPath } from '@features/layout/utils/navItems'

const FAVOURITES_PATH = '/favourites'

// The Favourites page, under /demo while in demo mode (ADR0009).
export function favouritesPath(isDemo) {
    return isDemo ? toDemoPath(FAVOURITES_PATH) : FAVOURITES_PATH
}
