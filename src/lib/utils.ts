import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Hide a broken image so its container's placeholder background shows instead of
// the browser's default broken-image glyph.
export function hideBrokenImg(e: { currentTarget: HTMLImageElement }) {
  e.currentTarget.style.display = 'none'
}
