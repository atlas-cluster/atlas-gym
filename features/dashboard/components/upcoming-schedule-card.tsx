'use client'

import {
  CalendarIcon,
  Dumbbell,
  MapPinIcon,
  Undo2Icon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import {
  cancelBooking,
  cancelSession,
  uncancelSession,
} from '@/features/courses'
import {
  type UpcomingRange,
  getUpcomingCourses,
} from '@/features/dashboard/actions/get-upcoming-courses'
import type { DashboardUpcomingCourse } from '@/features/dashboard/types'
import { BannerImage } from '@/features/shared/components/banner-image'
import { Badge } from '@/features/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/features/shared/components/ui/tabs'
import { cn } from '@/features/shared/lib/utils'

const MAX_VISIBLE = 6

interface UpcomingScheduleCardProps {
  initialCourses: DashboardUpcomingCourse[]
  initialRange?: UpcomingRange
}

export function UpcomingScheduleCard({
  initialCourses,
  initialRange = '7days',
}: UpcomingScheduleCardProps) {
  const [range, setRange] = useState<UpcomingRange>(initialRange)
  const [courses, setCourses] = useState(initialCourses)
  const [prevInitialCourses, setPrevInitialCourses] = useState(initialCourses)
  const [isPending, startTransition] = useTransition()

  // Sync when parent provides new data (e.g. after router.refresh())
  if (prevInitialCourses !== initialCourses) {
    setPrevInitialCourses(initialCourses)
    if (range === initialRange) {
      setCourses(initialCourses)
    }
  }

  const handleRangeChange = (newRange: string) => {
    const r = newRange as UpcomingRange
    setRange(r)
    startTransition(async () => {
      const data = await getUpcomingCourses(r)
      setCourses(data)
    })
  }

  const handleAction = (action: () => Promise<void>) => {
    startTransition(async () => {
      await action()
      const data = await getUpcomingCourses(range)
      setCourses(data)
    })
  }

  const trainerCourses = courses.filter((c) => c.role === 'trainer')
  const bookedCourses = courses.filter((c) => c.role === 'booking')

  const trainerOverflows = trainerCourses.length > MAX_VISIBLE
  const visibleTrainer = trainerCourses.slice(
    0,
    trainerOverflows ? MAX_VISIBLE - 1 : MAX_VISIBLE
  )
  const overflowTrainer = trainerCourses.length - visibleTrainer.length

  const bookedOverflows = bookedCourses.length > MAX_VISIBLE
  const visibleBooked = bookedCourses.slice(
    0,
    bookedOverflows ? MAX_VISIBLE - 1 : MAX_VISIBLE
  )
  const overflowBooked = bookedCourses.length - visibleBooked.length

  const rangeLabel =
    range === 'today'
      ? 'Today'
      : range === '7days'
        ? 'Next 7 Days'
        : 'Next 30 Days'

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardDescription className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5" />
            Upcoming Schedule
          </span>
          <Tabs value={range} onValueChange={handleRangeChange}>
            <TabsList className="h-7">
              <TabsTrigger value="today" className="text-xs px-2 py-0.5">
                Today
              </TabsTrigger>
              <TabsTrigger value="7days" className="text-xs px-2 py-0.5">
                7 Days
              </TabsTrigger>
              <TabsTrigger value="30days" className="text-xs px-2 py-0.5">
                30 Days
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardDescription>
        <CardTitle className="text-lg font-semibold">{rangeLabel}</CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          'grid gap-3',
          isPending && 'opacity-50 pointer-events-none transition-opacity'
        )}>
        {trainerCourses.length === 0 && bookedCourses.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No sessions{' '}
            {range === 'today'
              ? 'today'
              : `in the next ${range === '7days' ? '7' : '30'} days`}
            .
          </div>
        ) : (
          <>
            {trainerCourses.length > 0 && (
              <div className="grid gap-3">
                <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Teaching
                </div>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {visibleTrainer.map((course) => (
                    <UpcomingCourseItem
                      key={course.sessionId}
                      course={course}
                      onAction={handleAction}
                    />
                  ))}
                  {overflowTrainer > 0 && (
                    <div className="flex items-center justify-center rounded-md border border-dashed p-3 text-muted-foreground text-sm">
                      +{overflowTrainer} more session
                      {overflowTrainer > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )}
            {bookedCourses.length > 0 && (
              <div className="grid gap-3">
                <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Booked
                </div>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {visibleBooked.map((course) => (
                    <UpcomingCourseItem
                      key={course.sessionId}
                      course={course}
                      onAction={handleAction}
                    />
                  ))}
                  {overflowBooked > 0 && (
                    <div className="flex items-center justify-center rounded-md border border-dashed p-3 text-muted-foreground text-sm">
                      +{overflowBooked} more session
                      {overflowBooked > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function UpcomingCourseItem({
  course,
  onAction,
}: {
  course: DashboardUpcomingCourse
  onAction: (action: () => Promise<void>) => void
}) {
  const dateLabel = new Date(course.sessionDate).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })

  const handleClick = () => {
    if (course.role === 'trainer' && !course.isCancelled && course.updatedAt) {
      onAction(async () => {
        const r = await cancelSession(
          course.sessionId,
          new Date(course.updatedAt!)
        )
        if (!r.success) {
          toast.error(r.message)
          throw new Error(r.message)
        }
        toast.success(r.message)
      })
    } else if (
      course.role === 'trainer' &&
      course.isCancelled &&
      course.updatedAt
    ) {
      onAction(async () => {
        const r = await uncancelSession(
          course.sessionId,
          new Date(course.updatedAt!)
        )
        if (!r.success) {
          toast.error(r.message)
          throw new Error(r.message)
        }
        toast.success(r.message)
      })
    } else if (
      course.role === 'booking' &&
      course.bookingId &&
      !course.isCancelled
    ) {
      onAction(async () => {
        const r = await cancelBooking(course.bookingId!)
        if (!r.success) {
          toast.error(r.message)
          throw new Error(r.message)
        }
        toast.success(r.message)
      })
    }
  }

  const hasAction =
    (course.role === 'trainer' && !!course.updatedAt) ||
    (course.role === 'booking' && !!course.bookingId && !course.isCancelled)

  const overlayLabel = (() => {
    if (course.role === 'trainer' && !course.isCancelled)
      return 'Cancel Session'
    if (course.role === 'trainer' && course.isCancelled)
      return 'Restore Session'
    if (course.role === 'booking') return 'Cancel Booking'
    return ''
  })()

  const overlayIcon = (() => {
    if (course.role === 'trainer' && !course.isCancelled)
      return <XIcon className="h-5 w-5" />
    if (course.role === 'trainer' && course.isCancelled)
      return <Undo2Icon className="h-5 w-5" />
    if (course.role === 'booking') return <XIcon className="h-5 w-5" />
    return null
  })()

  const overlayColor =
    course.role === 'trainer' && course.isCancelled
      ? 'text-primary'
      : 'text-destructive'

  return (
    <button
      type="button"
      onClick={hasAction ? handleClick : undefined}
      disabled={!hasAction}
      className={cn(
        'group relative flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors',
        hasAction && 'hover:border-destructive/50',
        hasAction &&
          course.role === 'trainer' &&
          course.isCancelled &&
          'hover:border-primary/50',
        course.isCancelled && 'opacity-50 hover:opacity-100',
        !hasAction && 'cursor-default'
      )}>
      {/* Hover overlay */}
      {hasAction && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
          <div
            className={cn(
              'flex items-center gap-2 text-sm font-medium',
              overlayColor
            )}>
            {overlayIcon}
            <span>{overlayLabel}</span>
          </div>
        </div>
      )}

      {course.bannerImageUrl ? (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
          <BannerImage
            src={course.bannerImageUrl}
            alt={course.name}
            className="h-12 w-12 object-cover"
          />
        </div>
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
          <Dumbbell className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-h-6">
          <span className="font-medium text-sm truncate">{course.name}</span>
          {course.isCancelled && (
            <Badge variant="destructive" className="text-xs shrink-0">
              Cancelled
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground text-xs mt-0.5">
          {dateLabel} · {course.startTime}–{course.endTime}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-muted-foreground text-xs">
          {course.trainerName && course.role !== 'trainer' && (
            <span className="flex items-center gap-1">
              <UserIcon className="h-3 w-3" />
              {course.trainerName}
            </span>
          )}
          {course.roomName && (
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-3 w-3" />
              {course.roomName}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
