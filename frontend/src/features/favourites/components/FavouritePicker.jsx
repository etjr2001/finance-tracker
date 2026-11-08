import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '@components/Modal'
import { Card } from '@components/Card'
import { SectionTitle } from '@components/SectionTitle'
import { StatusMessage } from '@components/StatusMessage'
import { useDemoMode } from '@features/demo/context/DemoModeContext'
import { toDemoPath } from '@features/layout/utils/navItems'
import { useFavourites } from '@features/favourites/hooks/useFavourites'
import { sortFavouritesByName } from '@features/favourites/utils/favouriteForm'
import { FavouriteSummary } from '@features/favourites/components/FavouriteSummary'

const FAVOURITES_PATH = '/favourites'

// Opened by the Favourites button in the Add transaction form (ADR0017).
// Picking one hands it to `onPick`, which fills the form in place; nothing
// is saved here. Sorted A–Z by name. The title stays put while the list
// scrolls, so a long list still fits a phone screen. With no Favourites it
// links to the Favourites page and doesn't return afterwards.
export function FavouritePicker({ onPick, onClose }) {
    const isDemo = useDemoMode()
    const { data: favourites, isLoading, isError } = useFavourites()
    const sortedFavourites = useMemo(() => (favourites ? sortFavouritesByName(favourites) : []), [favourites])

    return (
        <Modal onRequestClose={onClose} contentClassName="max-w-md max-h-[85vh] flex flex-col">
            <SectionTitle className="mb-4 shrink-0">Favourites</SectionTitle>

            {isLoading && <StatusMessage>Loading favourites…</StatusMessage>}
            {isError && <StatusMessage tone="error">Could not load favourites.</StatusMessage>}

            {favourites?.length === 0 && (
                <StatusMessage>
                    No favourites yet.{' '}
                    <Link to={isDemo ? toDemoPath(FAVOURITES_PATH) : FAVOURITES_PATH} className="text-deposit underline">
                        Add one on the Favourites page
                    </Link>
                </StatusMessage>
            )}

            {sortedFavourites.length > 0 && (
                <div className="min-h-0 overflow-y-auto">
                    <Card className="divide-y divide-rule-soft">
                        {sortedFavourites.map((favourite) => (
                            <button
                                key={favourite.id}
                                type="button"
                                onClick={() => onPick(favourite)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left"
                            >
                                <FavouriteSummary favourite={favourite} />
                            </button>
                        ))}
                    </Card>
                </div>
            )}
        </Modal>
    )
}
