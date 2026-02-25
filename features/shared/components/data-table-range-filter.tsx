import { PlusCircle } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { Input } from '@/features/shared/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/features/shared/components/ui/popover'
import { Separator } from '@/features/shared/components/ui/separator'
import { Slider } from '@/features/shared/components/ui/slider'
import type { Column } from '@tanstack/react-table'

interface DataTableRangeFilterProps<TData> {
  column?: Column<TData, unknown>
  title: string
  min?: number
  max?: number
  formatValue?: (value: number) => string
  step?: number
}

export function DataTableRangeFilter<TData>({
  column,
  title,
  min: minProp,
  max: maxProp,
  formatValue = (v) => String(v),
  step = 1,
}: DataTableRangeFilterProps<TData>) {
  const facetedMinMax = column?.getFacetedMinMaxValues()
  const min = minProp ?? facetedMinMax?.[0] ?? 0
  const max = maxProp ?? facetedMinMax?.[1] ?? 100

  const filterValue = column?.getFilterValue() as [number, number] | undefined
  const value: [number, number] = filterValue ?? [min, max]

  const [localMin, setLocalMin] = useState(String(value[0]))
  const [localMax, setLocalMax] = useState(String(value[1]))
  const [open, setOpen] = useState(false)

  const isFiltered = value[0] !== min || value[1] !== max

  const handleApply = () => {
    const newMin = Math.max(min, Math.min(parseFloat(localMin) || min, max))
    const newMax = Math.max(min, Math.min(parseFloat(localMax) || max, max))
    const range: [number, number] = [
      Math.min(newMin, newMax),
      Math.max(newMin, newMax),
    ]
    column?.setFilterValue(
      range[0] === min && range[1] === max ? undefined : range
    )
  }

  const handleReset = () => {
    column?.setFilterValue(undefined)
    setLocalMin(String(min))
    setLocalMax(String(max))
  }

  const handleSliderChange = (newValue: number[]) => {
    const [newMin, newMax] = newValue as [number, number]
    setLocalMin(String(newMin))
    setLocalMax(String(newMax))
    column?.setFilterValue(
      newMin === min && newMax === max ? undefined : [newMin, newMax]
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-dashed"
          suppressHydrationWarning>
          <PlusCircle />
          {title}

          {isFiltered && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="default" className="rounded-sm px-1 font-normal">
                {formatValue(value[0])} - {formatValue(value[1])}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{title}</span>
              <span className="text-sm text-muted-foreground">
                {formatValue(value[0])} - {formatValue(value[1])}
              </span>
            </div>

            <Slider
              value={value}
              onValueChange={handleSliderChange}
              min={min}
              max={max}
              step={step}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">Min</label>
              <Input
                type="number"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                onBlur={handleApply}
                min={min}
                max={max}
                step={step}
                className="h-8"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">Max</label>
              <Input
                type="number"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                onBlur={handleApply}
                min={min}
                max={max}
                step={step}
                className="h-8"
              />
            </div>
          </div>

          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="w-full">
              Reset
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
