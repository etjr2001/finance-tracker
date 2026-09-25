import { Link } from 'react-router-dom'
import { AuthCard } from '@features/auth/components/AuthCard'

// Terminal "what happens next" screen (email sent, password updated, link
// expired…): a title, a message, and one link onward.
export function AuthNotice({ title, linkTo, linkLabel, children }) {
    return (
        <AuthCard title={title} isCentered>
            <p className="text-ink-soft text-sm mt-4">{children}</p>
            <Link to={linkTo} className="inline-block mt-6 text-ink underline underline-offset-2 text-sm">
                {linkLabel}
            </Link>
        </AuthCard>
    )
}
