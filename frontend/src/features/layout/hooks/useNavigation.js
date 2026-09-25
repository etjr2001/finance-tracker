import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useDemoMode } from '@features/demo/context/DemoModeContext'
import { useCarriedMonth } from '@features/layout/hooks/useCarriedMonth'
import { resolveNavItems } from '@features/layout/utils/navItems'

// Everything the shell's navigation needs: resolved links and the
// Log out / Exit demo action. AuthProvider wraps the whole app (including
// /demo), so useAuth is always safe; logout just isn't used in demo mode.
export function useNavigation() {
    const { logout } = useAuth()
    const isDemo = useDemoMode()
    const navigate = useNavigate()
    const carriedMonth = useCarriedMonth()

    const navItems = useMemo(() => resolveNavItems({ isDemo, carriedMonth }), [isDemo, carriedMonth])

    function exit() {
        if (isDemo) {
            navigate('/login')
            return
        }
        logout()
    }

    return {
        isDemo,
        navItems,
        exitLabel: isDemo ? 'Exit demo' : 'Log out',
        exit,
    }
}
