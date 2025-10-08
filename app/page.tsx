"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BookingInput } from "@/components/booking-input"
import { BoardingTable } from "@/components/boarding-table"
import { BusVisualization } from "@/components/bus-visualization"
import { computeBoardingSequence, estimateTotalTime, parseCsvOrText, type SequenceRow } from "@/lib/boarding"
import { Download } from "lucide-react"

export default function Page() {
  const [rawText, setRawText] = useState<string>("")
  const [rows, setRows] = useState<SequenceRow[]>([])
  const [generated, setGenerated] = useState(false)

  const totalTime = useMemo(() => estimateTotalTime(rows), [rows])

  function handleGenerate() {
    const parsed = parseCsvOrText(rawText)
    const seq = computeBoardingSequence(parsed)
    setRows(seq)
    setGenerated(true)
  }

  function handleReset() {
    setRawText("")
    setRows([])
    setGenerated(false)
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-balance">Bus Boarding Sequence Generator</h1>
        <p className="text-sm text-muted-foreground mt-2 text-pretty">
          Upload or paste booking data to generate an optimized boarding order from a single front entry to minimize
          congestion.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Input</CardTitle>
          <CardDescription>
            Provide CSV or plain text. First value per line is Booking_ID, remaining values are seats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <BookingInput
            value={rawText}
            onChange={setRawText}
            example={`Booking_ID,Seats
101,A1,B1
120,A20,C2
105,B10
108,C18,D18`}
          />

          <div className="flex items-center gap-2">
            <Button onClick={handleGenerate} disabled={!rawText.trim()}>
              Generate Sequence
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <TooltipProvider>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="order-2 lg:order-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Boarding Sequence</CardTitle>
                  <CardDescription>Sorted by farthest seat row descending, then by lowest Booking_ID.</CardDescription>
                </div>
                <ExportButton rows={rows} disabled={!generated || rows.length === 0} />
              </div>
            </CardHeader>
            <CardContent>
              <BoardingTable rows={rows} />
              <p className="mt-4 text-sm text-muted-foreground">
                Estimated total boarding time: <span className="font-medium">{totalTime}s</span> (1s per farthest row
                per booking)
              </p>
            </CardContent>
          </Card>

          <Card className="order-1 lg:order-2">
            <CardHeader>
              <CardTitle className="text-lg">Bus Layout</CardTitle>
              <CardDescription>A–D columns, 1–20 rows. Front entry near row 1.</CardDescription>
            </CardHeader>
            <CardContent>
              <BusVisualization rows={rows} />
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </main>
  )
}

function ExportButton({ rows, disabled }: { rows: SequenceRow[]; disabled?: boolean }) {
  function handleExport() {
    const header = ["Seq", "Booking_ID", "Seats", "Boarding Priority"]
    const lines = rows.map((r, idx) => {
      const seats = r.seats.join(" ")
      return [String(idx + 1), String(r.bookingId), seats, r.priority]
    })
    const content = [header, ...lines].map((arr) => arr.map(csvEscape).join(",")).join("\n")
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "boarding-sequence.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button onClick={handleExport} disabled={disabled}>
      <Download className="size-4 mr-2" aria-hidden="true" />
      Export CSV
    </Button>
  )
}

function csvEscape(value: string) {
  const needsQuotes = /[",\n]/.test(value)
  const v = value.replace(/"/g, '""')
  return needsQuotes ? `"${v}"` : v
}
