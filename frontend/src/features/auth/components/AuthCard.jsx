import { Card } from '@components/Card'

// Centred, full-screen card shell shared by every auth screen.
export function AuthCard({ title, subtitle, isCentered = false, children }) {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-paper">
            <Card className={`w-full max-w-sm p-8 ${isCentered ? 'text-center' : ''}`}>
                <h1 className="font-serif font-semibold text-3xl mb-1">{title}</h1>
                {subtitle && <p className="text-ink-soft text-sm mb-8">{subtitle}</p>}
                {children}
            </Card>
        </div>
    )
}
