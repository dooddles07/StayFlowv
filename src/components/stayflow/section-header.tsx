import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import * as React from 'react'
import { cn } from '#/lib/utils'

interface SectionHeaderProps {
  title: string
  description?: string
  viewAllHref?: string
  action?: React.ReactNode
  className?: string
  demo?: boolean
}

export function SectionHeader({ title, description, viewAllHref, action, className, demo }: SectionHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-3', className)}>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
          {demo && (
            <span
              className="rounded-full bg-accent-gold/15 px-1.5 py-0.5 text-[10px] font-medium text-accent-gold"
              title="Sample data — not yet tracked in the live database"
            >
              Demo data
            </span>
          )}
        </div>
        {description && <p className="mt-0.5 text-xs text-muted-text">{description}</p>}
      </div>
      {action}
      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-accent-indigo-soft transition-colors hover:text-accent-gold"
        >
          View all
          <ChevronRight className="size-3.5" />
        </Link>
      )}
    </div>
  )
}
