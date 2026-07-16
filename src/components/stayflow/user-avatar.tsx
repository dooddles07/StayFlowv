import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { avatarGradient, avatarUrl, getInitials } from '#/lib/avatar'
import { cn } from '#/lib/utils'

// Renders a DiceBear avatar when a style is set, otherwise the seeded initials gradient.
// Radix Avatar shows the fallback automatically while the image loads or if it fails.
export function UserAvatar({
  seed,
  style,
  name,
  className,
}: {
  seed: string
  style?: string | null
  name?: string
  className?: string
}) {
  const label = name ?? seed
  return (
    <Avatar className={cn('size-9', className)}>
      {style ? <AvatarImage src={avatarUrl(style, seed)} alt="" /> : null}
      <AvatarFallback className="text-xs font-medium text-white" style={{ background: avatarGradient(label) }}>
        {getInitials(label)}
      </AvatarFallback>
    </Avatar>
  )
}
