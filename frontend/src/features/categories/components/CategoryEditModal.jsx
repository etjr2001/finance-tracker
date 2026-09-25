import { createElement } from 'react'
import { X } from 'lucide-react'
import { Modal } from '@components/Modal'
import { Button } from '@components/Button'
import { IconButton } from '@components/IconButton'
import { FormField } from '@components/FormField'
import { CategoryTile } from '@features/categories/components/CategoryTile'
import { COLOR_KEYS, categoryBarClass } from '@features/categories/utils/categorySwatch'
import { ICON_KEYS, categoryIcon } from '@features/categories/utils/categoryIcon'
import { MAX_CATEGORY_NAME_LENGTH } from '@features/categories/utils/categoryName'

// Full name + colour + icon editor for an existing Category (docs/backlog.md,
// "Category color/icon"). Creation stays fewest-click (NewCategoryForm/
// NewCategoryModal); this is where a Category's auto-assigned colour/icon
// get customised afterwards.
export function CategoryEditModal({
    name,
    onNameChange,
    colorKey,
    onColorKeyChange,
    iconKey,
    onIconKeyChange,
    error,
    isSaving,
    onSave,
    onCancel,
}) {
    return (
        <Modal onRequestClose={onCancel}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif font-semibold text-lg">Edit category</h2>
                <IconButton icon={X} label="Close" onClick={onCancel} />
            </div>

            <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-paper">
                <CategoryTile colorKey={colorKey} iconKey={iconKey} size="lg" />
                <div className="min-w-0">
                    <div className="font-medium truncate">{name || 'Category'}</div>
                    <div className="text-xs text-ink-soft">Preview</div>
                </div>
            </div>

            <FormField
                label="Name"
                htmlFor="editCategoryName"
                autoFocus
                type="text"
                maxLength={MAX_CATEGORY_NAME_LENGTH}
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                className="mb-5"
            />

            <div className="mb-5">
                <span className="block text-sm mb-2">Colour</span>
                {/* ADR0010: touch targets are at least 44px (h-11/w-11), not
                    just the colour dot's natural size. */}
                <div className="flex flex-wrap gap-2">
                    {COLOR_KEYS.map((key) => (
                        <button
                            key={key}
                            type="button"
                            aria-label={`Colour ${key}`}
                            aria-pressed={colorKey === key}
                            onClick={() => onColorKeyChange(key)}
                            className="h-11 w-11 shrink-0 flex items-center justify-center rounded-full"
                        >
                            <span
                                className={`h-7 w-7 rounded-full ${categoryBarClass(key)} ${
                                    colorKey === key ? 'ring-2 ring-offset-2 ring-ink' : ''
                                }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-5">
                <span className="block text-sm mb-2">Icon</span>
                {/* 6 columns of 44px buttons (ADR0010's touch-target minimum)
                    fit the modal's fixed max-w-md content width at any
                    viewport, so this doesn't need a wider-screen variant. */}
                <div className="grid grid-cols-6 gap-2">
                    {ICON_KEYS.map((key) => (
                        <button
                            key={key}
                            type="button"
                            aria-label={`Icon ${key}`}
                            aria-pressed={iconKey === key}
                            onClick={() => onIconKeyChange(key)}
                            className={`h-11 w-11 flex items-center justify-center rounded-lg border ${
                                iconKey === key ? 'border-ink' : 'border-rule'
                            }`}
                        >
                            {createElement(categoryIcon(key), {
                                'aria-hidden': 'true',
                                strokeWidth: 1.7,
                                className: 'h-5 w-5',
                            })}
                        </button>
                    ))}
                </div>
            </div>

            {error && <p className="mb-4 text-xs text-withdrawal">{error}</p>}

            <div className="flex gap-4">
                <Button onClick={onSave} disabled={isSaving}>
                    Save
                </Button>
                <Button variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </Modal>
    )
}
