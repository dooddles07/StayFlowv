export const FACILITY_TIME_SLOTS = [
  '7:00 AM – 8:30 AM',
  '9:00 AM – 10:30 AM',
  '11:00 AM – 12:30 PM',
  '1:00 PM – 2:30 PM',
  '3:00 PM – 4:30 PM',
  '5:00 PM – 6:30 PM',
  '7:00 PM – 8:30 PM',
]

// Half-hour marks, 6:00 AM – 11:30 PM — for arrival-time pickers (guests, etc.)
// where a single point in time is needed rather than a facility booking slot.
export const TIME_OF_DAY_OPTIONS: string[] = (() => {
  const options: string[] = []
  for (let hour = 6; hour <= 23; hour++) {
    for (const minute of ['00', '30']) {
      const period = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 === 0 ? 12 : hour % 12
      options.push(`${hour12}:${minute} ${period}`)
    }
  }
  return options
})()

// Parses the first "H:MM AM/PM" found in a string to minutes-since-midnight — plain
// string comparison on these values (no leading zero) sorts "9:00 AM" after "11:00 AM"
// and similar. Matches the leading time in a range string too ("7:00 AM – 8:30 AM"),
// so it works for both single-point times and facility time slots.
export function timeToMinutes(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return 0
  const [, hourStr, minuteStr, period] = match
  let hour = Number(hourStr) % 12
  if (period.toUpperCase() === 'PM') hour += 12
  return hour * 60 + Number(minuteStr)
}

export function nextDays(count: number): Date[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    return d
  })
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Floors to a positive integer; anything invalid (empty, negative, zero, decimal, NaN)
// falls back to `fallback` instead of silently becoming 0 or a negative number. Used
// by admin forms that set a venue's own capacity/limit — the field being set here is
// itself the ceiling other pickers clamp against, so there's no upper bound to enforce.
export function clampPositiveInt(raw: string, fallback = 1): number {
  const n = Math.floor(Number(raw))
  return Number.isFinite(n) && n >= 1 ? n : fallback
}

// Whole numbers only, 1..max — a party can't be negative, zero, or fractional. Native
// number-input min/max are cosmetic here since these forms preventDefault() on submit,
// so this is the only thing actually stopping "-5" or "2.5" from reaching the API.
export function clampPartySize(raw: string, max: number): number {
  return Math.min(clampPositiveInt(raw), max)
}
