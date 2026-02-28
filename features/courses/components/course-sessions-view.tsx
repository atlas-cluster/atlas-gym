'use client'

import {
  BookmarkIcon,
  BookmarkXIcon,
  CalendarIcon,
  ClockIcon,
  RefreshCwIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

import {
  CourseSessionDisplay,
  bookCourseSession,
  cancelCourseBooking,
  getCourseSessions,
} from '@/features/courses'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import { Input } from '@/features/shared/components/ui/input'

interface CourseSessionsViewProps {
  initialData: CourseSessionDisplay[]
}

export function CourseSessionsView({ initialData }: CourseSessionsViewProps) {
  const [isPending, startTransition] = useTransition()
  const [sessions, setSessions] = useState<CourseSessionDisplay[]>(initialData)
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [bookingPending, setBookingPending] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSessions(initialData)
  }, [initialData])

  const onRefresh = () => {
    startTransition(async () => {
      const result = await getCourseSessions(startDate || undefined, endDate || undefined)
      setSessions(result)
    })
  }

  const handleApplyFilter = () => {
    startTransition(async () => {
      const result = await getCourseSessions(startDate || undefined, endDate || undefined)
      setSessions(result)
    })
  }

  const handleBook = (session: CourseSessionDisplay) => {
    setBookingPending((prev) => new Set(prev).add(session.id))
    const promise = bookCourseSession(session.id)
      .then((result) => {
        if (!result.success) throw new Error(result.message)
        return getCourseSessions(startDate || undefined, endDate || undefined).then((data) => {
          setSessions(data)
          return result
        })
      })
      .finally(() => {
        setBookingPending((prev) => {
          const next = new Set(prev)
          next.delete(session.id)
          return next
        })
      })

    toast.promise(promise, {
      loading: 'Booking session...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to book session',
    })
  }

  const handleCancelBooking = (session: CourseSessionDisplay) => {
    if (!session.bookingId) return
    setBookingPending((prev) => new Set(prev).add(session.id))
    const promise = cancelCourseBooking(session.bookingId)
      .then((result) => {
        if (!result.success) throw new Error(result.message)
        return getCourseSessions(startDate || undefined, endDate || undefined).then((data) => {
          setSessions(data)
          return result
        })
      })
      .finally(() => {
        setBookingPending((prev) => {
          const next = new Set(prev)
          next.delete(session.id)
          return next
        })
      })

    toast.promise(promise, {
      loading: 'Cancelling booking...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to cancel booking',
    })
  }

  const filtered = sessions.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.trainerName.toLowerCase().includes(search.toLowerCase()) ||
      s.roomName.toLowerCase().includes(search.toLowerCase())
  )

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  function formatTime(time: string) {
    return time.slice(0, 5)
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="w-full md:w-64"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            type="date"
            className="w-full md:w-44"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            className="w-full md:w-44"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <ButtonGroup>
            <Button
              variant="outline"
              type="button"
              suppressHydrationWarning
              onClick={handleApplyFilter}
              disabled={isPending}>
              Apply
            </Button>
            {(startDate || endDate || search) && (
              <Button
                variant="ghost"
                size="icon"
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setSearch('')
                  setStartDate('')
                  setEndDate('')
                  startTransition(async () => {
                    const result = await getCourseSessions()
                    setSessions(result)
                  })
                }}>
                <XIcon />
                <span className="sr-only">Clear filters</span>
              </Button>
            )}
          </ButtonGroup>

          <Button
            variant="outline"
            size="icon"
            type="button"
            disabled={isPending}
            suppressHydrationWarning
            onClick={onRefresh}
            className="ml-auto">
            <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((session) => {
            const isFull = session.bookedCount >= session.roomCapacity
            const isBooked = !!session.bookingId
            const isPendingAction = bookingPending.has(session.id)

            return (
              <Card key={session.id} className={session.isCancelled ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        {session.name}
                        {session.isCancelled && (
                          <Badge variant="destructive" className="text-xs">
                            Cancelled
                          </Badge>
                        )}
                        {isBooked && !session.isCancelled && (
                          <Badge variant="default" className="text-xs">
                            Booked
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {session.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(session.sessionDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {formatTime(session.startTime)} – {formatTime(session.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <span>{session.trainerName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{session.roomName}</span>
                    <div className="flex items-center gap-1">
                      <UsersIcon className="w-3 h-3 text-muted-foreground" />
                      <span
                        className={
                          isFull ? 'text-destructive font-medium' : 'text-muted-foreground'
                        }>
                        {session.bookedCount}/{session.roomCapacity}
                      </span>
                    </div>
                  </div>

                  {!session.isCancelled && (
                    <div className="pt-2">
                      {isBooked ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={isPendingAction}
                          suppressHydrationWarning
                          onClick={() => handleCancelBooking(session)}>
                          <BookmarkXIcon className="w-4 h-4" />
                          Cancel Booking
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                          disabled={isFull || isPendingAction}
                          suppressHydrationWarning
                          onClick={() => handleBook(session)}>
                          <BookmarkIcon className="w-4 h-4" />
                          {isFull ? 'Session Full' : 'Book Session'}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            {search ? 'No sessions found matching your search.' : 'No upcoming sessions available.'}
          </p>
        </div>
      )}
    </div>
  )
}
