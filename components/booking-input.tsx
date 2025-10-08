"use client"

import type { ChangeEvent } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function BookingInput({
  value,
  onChange,
  example,
}: {
  value: string
  onChange: (v: string) => void
  example?: string
}) {
  async function onFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    onChange(text)
  }

  function pasteExample() {
    if (example) onChange(example)
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="file">Upload CSV</Label>
          <Input id="file" type="file" accept=".csv,text/csv,text/plain" onChange={onFileSelect} />
          <p className="text-xs text-muted-foreground">
            Format: First value per line is Booking_ID, remaining values are seats (e.g., 101,A1,B1).
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="example">Need an example?</Label>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={pasteExample}>
              Paste example data
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Quickly try the generator with sample data.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text">Or paste booking data</Label>
        <Textarea
          id="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          placeholder={"Booking_ID,Seats\n101,A1,B1\n120,A20,C2\n105,B10\n108,C18,D18"}
          className="font-mono"
        />
      </div>
    </div>
  )
}
