'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { DateRange } from 'react-day-picker'

import { Button } from '@/features/shared/components/ui/button'
import { Calendar } from '@/features/shared/components/ui/calendar'
import { Field, FieldLabel } from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/features/shared/components/ui/popover'
import { Column } from '@tanstack/react-table'

interface DataTableDateRangeFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
}

export function DataTableDateRangeFilter<TData, TValue>({
  column,
  title = 'Date',
}: DataTableDateRangeFilterProps<TData, TValue>) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    column?.getFilterValue() as DateRange | undefined
  )
  const [startTime, setStartTime] = React.useState('00:00')
  const [endTime, setEndTime] = React.useState('23:59')

  const filterValue = column?.getFilterValue() as DateRange | undefined

  React.useEffect(() => {
    // If the filter is externally cleared or updated
    // Simple check if date changed from outside
    if (JSON.stringify(filterValue) !== JSON.stringify(date)) {
      if (filterValue?.from) {
        setDate(filterValue)
        setStartTime(format(filterValue.from, 'HH:mm'))
        if (filterValue.to) {
          setEndTime(format(filterValue.to, 'HH:mm'))
        }
      } else {
        setDate(undefined)
      }
    }
  }, [filterValue, date])

  const updateFilter = (
    newDate: DateRange | undefined,
    sTime: string,
    eTime: string
  ) => {
    if (!newDate?.from) {
      column?.setFilterValue(undefined)
      return
    }

    const from = new Date(newDate.from)
    const [sh, sm] = sTime.split(':').map(Number)
    from.setHours(sh, sm)

    const to = newDate.to ? new Date(newDate.to) : undefined
    if (to) {
      const [eh, em] = eTime.split(':').map(Number)
      to.setHours(eh, em)
    }

    if (to && from > to) {
      // Simple swap if user makes mistake? or just let it be invalid?
      // Let's assume day picker handles sort, but time might flip it.
    }

    column?.setFilterValue({ from, to })
  }

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate)
    updateFilter(selectedDate, startTime, endTime)
  }

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartTime(value)
      updateFilter(date, value, endTime)
    } else {
      setEndTime(value)
      updateFilter(date, startTime, value)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          size={'sm'}
          className={'h-9 justify-start text-left font-normal border-dashed'}>
          <CalendarIcon />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'dd.MM.y HH:mm')} -{' '}
                {format(date.to, 'dd.MM.y HH:mm')}
              </>
            ) : (
              format(date.from, 'dd.MM.y HH:mm')
            )
          ) : (
            <span>{title}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
        <div className="p-3 border-t flex items-center gap-2">
          <Field className={'w-fit'}>
            <FieldLabel>Start Time</FieldLabel>
            <Input
              type="text"
              value={startTime}
              onChange={(e) => handleTimeChange('start', e.target.value)}
              placeholder="HH:MM"
              pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
            />
          </Field>
          <Field className={'w-fit'}>
            <FieldLabel>End Time</FieldLabel>
            <Input
              type="text"
              value={endTime}
              onChange={(e) => handleTimeChange('end', e.target.value)}
              placeholder="HH:MM"
              pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
            />
          </Field>
        </div>
      </PopoverContent>
    </Popover>
  )
}
