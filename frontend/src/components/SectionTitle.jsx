// Heading for a modal, sheet, popover or card section, in ADR0010's heading
// type (Source Serif 4, weight 600). Use this rather than typing the classes,
// so every heading stays in the same style. PageTitle is the larger page-level
// version.
//
// `as` picks the tag (h2 for a modal's own title, h3 inside a page section).
// `className` is for spacing and placement only, since those depend on the
// layout around the heading (e.g. no margin when it shares a row with a
// Close button, or centred in MonthPicker's header).
export function SectionTitle({ as: Tag = 'h2', className = '', children }) {
    return <Tag className={`font-serif font-semibold text-lg ${className}`}>{children}</Tag>
}
