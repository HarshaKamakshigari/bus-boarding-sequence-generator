export type Booking = {
  bookingId: number
  seats: string[]
}

export type SequenceRow = {
  bookingId: number
  seats: string[]
  maxRow: number
  priority: "Highest" | "High" | "Medium" | "Low"
  // seq is derived in the table for display when needed
  seq?: number
}

// Parse CSV or text where each line is: Booking_ID,Seat[,Seat...]
export function parseCsvOrText(input: string): Booking[] {
  const lines = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return []

  // Detect and drop header if first token isn't numeric
  const hasHeader = lines[0].toLowerCase().startsWith("booking_id")
  const dataLines = hasHeader ? lines.slice(1) : lines

  const bookings: Booking[] = []
  for (const line of dataLines) {
    // The "Seats" field is actually multiple comma-separated seat tokens after the first value
    const parts = line
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
    if (parts.length < 2) continue
    const idStr = parts[0]
    const bookingId = Number(idStr)
    if (!Number.isFinite(bookingId)) continue
    const seats = parts.slice(1).map((s) => s.toUpperCase())
    bookings.push({ bookingId, seats })
  }
  return bookings
}

export function computeBoardingSequence(bookings: Booking[]): SequenceRow[] {
  const rows: SequenceRow[] = bookings.map((b) => {
    const maxRow = farthestRow(b.seats)
    const priority = rowToPriority(maxRow)
    return { bookingId: b.bookingId, seats: b.seats, maxRow, priority }
  })

  // Sort by farthest seat row DESC, then by Booking_ID ASC
  rows.sort((a, b) => {
    if (b.maxRow !== a.maxRow) return b.maxRow - a.maxRow
    return a.bookingId - b.bookingId
  })

  // Assign seq for convenience
  rows.forEach((r, i) => (r.seq = i + 1))
  return rows
}

export function estimateTotalTime(rows: SequenceRow[]): number {
  // 1s per farthest row per booking, summed
  return rows.reduce((sum, r) => sum + (Number.isFinite(r.maxRow) ? r.maxRow : 0), 0)
}

function farthestRow(seats: string[]): number {
  let max = 0
  for (const seat of seats) {
    const m = seat.match(/^[A-D]([0-9]{1,2})$/i)
    if (!m) continue
    const row = Number.parseInt(m[1], 10)
    if (Number.isFinite(row) && row > max) max = row
  }
  return max
}

function rowToPriority(row: number): SequenceRow["priority"] {
  // Thresholds aligned with the example provided
  if (row >= 16) return "Highest"
  if (row >= 11) return "High"
  if (row >= 6) return "Medium"
  return "Low"
}
