// White surface with a hairline border, per ADR0010: 14px radius, no
// shadow (shadows are reserved for floating layers like popovers).
export default function Card({ className = '', children }) {
    return (
        <div className={`bg-paper-raised border border-rule rounded-[14px] p-5 ${className}`}>
            {children}
        </div>
    )
}
