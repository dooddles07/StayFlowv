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
