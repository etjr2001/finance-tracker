import { Outlet } from 'react-router-dom'
import { DemoBanner } from '@features/demo/components/DemoBanner'
import { useNavigation } from '@features/layout/hooks/useNavigation'
import { MobileHeader } from '@features/layout/components/MobileHeader'
import { Sidebar } from '@features/layout/components/Sidebar'
import { BottomTabBar } from '@features/layout/components/BottomTabBar'

export function AppLayout() {
    const { isDemo, navItems, exitLabel, exit } = useNavigation()

    return (
        <div className="min-h-screen flex flex-col">
            {isDemo && <DemoBanner />}
            <MobileHeader exitLabel={exitLabel} onExit={exit} />

            {/* Sidebar + content centred together on wide screens, so the
                empty space doesn't all pile up on the right. */}
            <div className="flex flex-1 flex-col md:flex-row md:max-w-[1400px] md:mx-auto md:w-full">
                <Sidebar navItems={navItems} exitLabel={exitLabel} onExit={exit} />

                {/* Content up to 1100px, centred (ADR0010). Mobile bottom
                    padding clears the fixed tab bar. */}
                <main className="flex-1 min-w-0 p-6 pb-24 md:p-10">
                    <div className="max-w-[1100px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            <BottomTabBar navItems={navItems} />
        </div>
    )
}
