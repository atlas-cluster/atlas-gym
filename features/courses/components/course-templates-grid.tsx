'use client'

import {
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

import { CourseTemplateDisplay, getCourseTemplates } from '@/features/courses'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import { Input } from '@/features/shared/components/ui/input'

const WEEKDAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
}

interface CourseTemplatesGridProps {
  data: CourseTemplateDisplay[]
  onCreate: () => void
  onEdit: (template: CourseTemplateDisplay) => void
  onDelete: (template: CourseTemplateDisplay) => void
}

export function CourseTemplatesGrid({
  data,
  onCreate,
  onEdit,
  onDelete,
}: CourseTemplatesGridProps) {
  const [isPending, startTransition] = useTransition()
  const [tableData, setTableData] = useState<CourseTemplateDisplay[]>(data)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setTableData(data)
  }, [data])

  const onRefresh = () => {
    startTransition(async () => {
      const result = await getCourseTemplates()
      setTableData(result)
    })
  }

  const filtered = tableData.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.trainerName.toLowerCase().includes(search.toLowerCase()) ||
      t.roomName.toLowerCase().includes(search.toLowerCase())
  )

  function formatTime(time: string) {
    return time.slice(0, 5)
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-72">
            <Input
              className="hidden md:flex"
              placeholder="Search course templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex w-full gap-2 md:hidden">
              <ButtonGroup className="flex-1">
                <Input
                  placeholder="Search course templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  disabled={isPending}
                  suppressHydrationWarning
                  onClick={onRefresh}>
                  <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
                  <span className="sr-only">Refresh</span>
                </Button>
              </ButtonGroup>
              <Button
                variant="default"
                size="icon"
                type="button"
                suppressHydrationWarning
                onClick={onCreate}>
                <PlusIcon />
                <span className="sr-only">Create Template</span>
              </Button>
            </div>
          </div>

          {search && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearch('')}
              suppressHydrationWarning>
              <XIcon />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <div className="hidden md:flex gap-2">
          <Button
            variant="outline"
            size="icon"
            type="button"
            disabled={isPending}
            suppressHydrationWarning
            onClick={onRefresh}>
            <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button
            variant="default"
            size="default"
            type="button"
            suppressHydrationWarning
            onClick={onCreate}>
            <PlusIcon />
            <span className="hidden md:inline">Create Template</span>
          </Button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                <CardAction>
                  <ButtonGroup>
                    <Button
                      variant="ghost"
                      size="icon"
                      suppressHydrationWarning
                      onClick={() => onEdit(template)}>
                      <PencilIcon />
                      <span className="sr-only">Edit template</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      suppressHydrationWarning
                      onClick={() => onDelete(template)}>
                      <TrashIcon />
                      <span className="sr-only">Delete template</span>
                    </Button>
                  </ButtonGroup>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span>{template.trainerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {formatTime(template.startTime)} – {formatTime(template.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {formatDate(template.startDate)}
                    {template.endDate ? ` – ${formatDate(template.endDate)}` : ' (no end)'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.weekdays.map((day) => (
                    <Badge key={day} variant="secondary" className="text-xs">
                      {WEEKDAY_LABELS[day] ?? day}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Room: <span className="font-medium text-foreground">{template.roomName}</span>{' '}
                  <span className="text-xs">(capacity: {template.roomCapacity})</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            {search ? 'No templates found matching your search.' : 'No course templates available.'}
          </p>
        </div>
      )}
    </div>
  )
}
