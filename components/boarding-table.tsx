"use client"

import { useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import type { SequenceRow } from "@/lib/boarding"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

type SortKey = "seq" | "bookingId" | "priority"
type SortDir = "asc" | "desc"

export function BoardingTable({ rows }: { rows: SequenceRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("seq")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const sorted = useMemo(() => {
    const withSeq = rows.map((r, i) => ({ ...r, seq: i + 1 }))
    const copy = [...withSeq]
    copy.sort((a, b) => {
      let cmp = 0
      if (sortKey === "seq") cmp = a.seq - b.seq
      if (sortKey === "bookingId") cmp = a.bookingId - b.bookingId
      if (sortKey === "priority") cmp = priorityRank(a.priority) - priorityRank(b.priority)
      return sortDir === "asc" ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  return (
    <div className="overflow-x-auto">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => toggleSort("seq")} className="cursor-pointer select-none">
                <HeaderSort label="Seq" active={sortKey === "seq"} dir={sortDir} />
              </TableHead>
              <TableHead onClick={() => toggleSort("bookingId")} className="cursor-pointer select-none">
                <HeaderSort label="Booking_ID" active={sortKey === "bookingId"} dir={sortDir} />
              </TableHead>
              <TableHead>Seats</TableHead>
              <TableHead onClick={() => toggleSort("priority")} className="cursor-pointer select-none">
                <HeaderSort label="Boarding Priority" active={sortKey === "priority"} dir={sortDir} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={`${row.bookingId}-${row.seats.join("-")}`}>
                <TableCell className="w-[60px]">{row.seq ?? "-"}</TableCell>
                <TableCell className="font-medium">{row.bookingId}</TableCell>
                <TableCell className="font-mono text-sm">{row.seats.join(", ")}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "inline-flex items-center rounded px-2 py-1 text-xs",
                          priorityBadgeClass(row.priority),
                        )}
                      >
                        {row.priority}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Farthest seat: row {row.maxRow}. Priority based on distance from front entry.</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  No data yet. Provide input and click Generate Sequence.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  )
}

function HeaderSort({ label, active, dir }: { label: string; active: boolean; dir: SortDir }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      {active ? (
        dir === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )
      ) : (
        <ArrowUpDown className="size-3.5 opacity-50" />
      )}
    </span>
  )
}

function priorityRank(p: SequenceRow["priority"]) {
  // Lower rank number means earlier in boarding order tiers for sorting purposes
  // Highest -> 1, High -> 2, Medium -> 3, Low -> 4
  return p === "Highest" ? 1 : p === "High" ? 2 : p === "Medium" ? 3 : 4
}

function priorityBadgeClass(p: SequenceRow["priority"]) {
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
