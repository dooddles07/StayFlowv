import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'

// Password field with a show/hide toggle. Same props as Input minus `type`.
export function PasswordInput({ className, ...props }: Omit<React.ComponentProps<typeof Input>, 'type'>) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('pr-10', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-0 top-0 flex h-9 w-10 items-center justify-center text-muted-text transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
