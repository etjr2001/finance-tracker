// White surface with a hairline border, per ADR0010: 14px radius, no
// shadow (shadows are reserved for floating layers like popovers).
//
// No default padding: how much a surface needs varies (a compact list vs.
// a hero auth form), and appending a padding utility via `className` isn't
// a reliable way to override one — Tailwind doesn't order generated
// utilities by where they appear in a class string, so callers always pass
// their own (e.g. `<Card className="p-5">`).
export default function Card({ className = '', children }) {
    return (
        <div className={`bg-paper-raised border border-rule rounded-[14px] ${className}`}>
            {children}
        </div>
    )
}
