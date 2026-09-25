import { Link } from 'react-router-dom'

export function AuthFooterLink({ to, prompt, className = 'mt-6', children }) {
    return (
        <p className={`text-sm text-ink-soft ${className}`}>
            {prompt && `${prompt} `}
            <Link to={to} className="text-ink underline underline-offset-2">
                {children}
            </Link>
        </p>
    )
}
