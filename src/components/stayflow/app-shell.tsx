import * as React from 'react'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { MobileBottomNav } from './mobile-bottom-nav'
import { Sheet, SheetContent, SheetTitle } from '#/components/ui/sheet'
import type { Portal } from '#/lib/hooks/use-portal-preference'

interface AppShellProps {
  portal: Portal
  identityName: string
  identitySubtitle: string
  identityLoading?: boolean
  avatarSeed?: string
  avatarStyle?: string | null
  // Keyed by nav item `to` path — true shows an unread dot on that nav entry.
  navBadges?: Partial<Record<string, boolean>>
  children: React.ReactNode
}

export function AppShell({ portal, identityName, identitySubtitle, identityLoading, avatarSeed, avatarStyle, navBadges, children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  return (
    <div className="flex min-h-dvh bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-lg focus-visible:bg-accent-indigo focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
      >
        Skip to main content
      </a>
      <Sidebar
        portal={portal}
        identityName={identityName}
        identitySubtitle={identitySubtitle}
        identityLoading={identityLoading}
        avatarSeed={avatarSeed}
        avatarStyle={avatarStyle}
        navBadges={navBadges}
        className="hidden lg:flex"
      />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 border-border bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar
            portal={portal}
            identityName={identityName}
            identitySubtitle={identitySubtitle}
            identityLoading={identityLoading}
            avatarSeed={avatarSeed}
            avatarStyle={avatarStyle}
            navBadges={navBadges}
            onNavigate={() => setMobileNavOpen(false)}
            className="flex w-full"
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          identityName={identityName}
          identitySubtitle={identitySubtitle}
          identityLoading={identityLoading}
          avatarSeed={avatarSeed}
          avatarStyle={avatarStyle}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main id="main-content" className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
      </div>

      <MobileBottomNav portal={portal} navBadges={navBadges} />
    </div>
  )
}
