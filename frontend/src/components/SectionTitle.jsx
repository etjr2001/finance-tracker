// Heading for a modal, sheet, popover or card section, in ADR0010's heading
// type (Source Serif 4, weight 600). Use this rather than typing the classes,
// so every heading stays in the same style. PageTitle is the larger page-level
// version.
//
// `as` picks the tag (h2 for a modal's own title, h3 inside a page section).
// `className` is for spacing only, since that depends on the layout around
// the heading (e.g. none when it shares a row with a Close button).
export function SectionTitle({ as: Tag = 'h2', className = '', children }) {
    return <Tag className={`font-serif font-semibold text-lg ${className}`}>{children}</Tag>
}
