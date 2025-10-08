"use client"

import type { SequenceRow } from "@/lib/boarding"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

const COLS = ["A", "B", "C", "D"] as const
const ROWS = Array.from({ length: 20 }, (_, i) => i + 1)

export function BusVisualization({ rows }: { rows: SequenceRow[] }) {
  const seatToInfo = new Map<string, { bookingId: number; priority: SequenceRow["priority"]; seq: number }>()
  rows.forEach((r, idx) => {
    r.seats.forEach((s) =>
      seatToInfo.set(s.toUpperCase(), { bookingId: r.bookingId, priority: r.priority, seq: idx + 1 }),
    )
  })

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">Front Entry</span>
          <span>Row 1</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          <div />
          {COLS.map((c) => (
            <div key={c} className="text-center text-xs font-medium">
              {c}
            </div>
          ))}

          {ROWS.map((r) => (
            <Row key={r} r={r} seatToInfo={seatToInfo} />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Row 20</span>
          <span className="font-medium">Rear</span>
        </div>
      </div>
    </TooltipProvider>
  )
}

function Row({
  r,
  seatToInfo,
}: {
  r: number
  seatToInfo: Map<string, { bookingId: number; priority: SequenceRow["priority"]; seq: number }>
}) {
  return (
    <>
      <div className="text-right pr-2 text-xs text-muted-foreground">{r}</div>
      {(["A", "B", "C", "D"] as const).map((c) => {
        const key = `${c}${r}`
        const info = seatToInfo.get(key)
        const label = key
        const cls = info ? seatCellClass(info.priority) : "bg-card text-muted-foreground border border-border"
        return (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "h-7 rounded flex items-center justify-center text-[11px] font-medium",
                  "transition-colors",
                  cls,
                )}
                aria-label={info ? `${label} booked by ${info.bookingId} seq ${info.seq}` : `${label} empty`}
                title=""
              >
                {label}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              {info ? (
                <div className="text-xs">
                  <div className="font-medium">Seat {label}</div>
                  <div>
                    Booking {info.bookingId} • Seq {info.seq} • {info.priority}
                  </div>
                </div>
              ) : (
                <div className="text-xs">Seat {label} • Empty</div>
              )}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </>
  )
}

function seatCellClass(p: SequenceRow["priority"]) {
  switch (p) {
    case "Highest":
      return "bg-primary text-primary-foreground"
    case "High":
      return "bg-accent text-accent-foreground"
    case "Medium":
      return "bg-secondary text-secondary-foreground"
    case "Low":
      return "bg-muted text-foreground"
  }
}
