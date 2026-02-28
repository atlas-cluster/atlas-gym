'use client'

import {
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
  cancelCourseBooking,
  getMyBookings,
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

interface MyBookingsViewProps {
  initialData: CourseSessionDisplay[]
}

export function MyBookingsView({ initialData }: MyBookingsViewProps) {
  const [isPending, startTransition] = useTransition()
  const [bookings, setBookings] = useState<CourseSessionDisplay[]>(initialData)
  const [search, setSearch] = useState('')
  const [cancelPending, setCancelPending] = useState<Set<string>>(new Set())

  useEffect(() => {
    setBookings(initialData)
  }, [initialData])

  const onRefresh = () => {
    startTransition(async () => {
      const result = await getMyBookings()
      setBookings(result)
    })
  }

  const handleCancelBooking = (session: CourseSessionDisplay) => {
    if (!session.bookingId) return
    setCancelPending((prev) => new Set(prev).add(session.id))
    const promise = cancelCourseBooking(session.bookingId)
      .then((result) => {
        if (!result.success) throw new Error(result.message)
        return getMyBookings().then((data) => {
          setBookings(data)
          return result
        })
      })
      .finally(() => {
        setCancelPending((prev) => {
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

  const today = new Date().toISOString().split('T')[0]

  const filtered = bookings.filter(
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
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex w-full flex-wrap items-center gap-2">
          {/* Desktop search input */}
          <Input
            className="hidden md:flex md:w-64"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Mobile: search + refresh in ButtonGroup */}
          <div className="flex w-full gap-2 md:hidden">
            <ButtonGroup className="flex-1">
              <Input
                placeholder="Search bookings..."
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
        {/* Right (desktop only): refresh button */}
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
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((session) => {
            const isPendingCancel = cancelPending.has(session.id)
            const sessionDateStr = new Date(session.sessionDate)
              .toISOString()
              .split('T')[0]
            const canCancel = !session.isCancelled && sessionDateStr >= today

            return (
              <Card key={`${session.bookingId ?? ''}-${session.id}`} className={session.isCancelled ? 'opacity-60' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    {session.name}
                    {session.isCancelled && (
                      <Badge variant="destructive" className="text-xs">
                        Cancelled
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {session.description || 'No description'}
                  </CardDescription>
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
                      <span className="text-muted-foreground">
                        {session.bookedCount}/{session.roomCapacity}
                      </span>
                    </div>
                  </div>
                  {canCancel && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={isPendingCancel}
                        suppressHydrationWarning
                        onClick={() => handleCancelBooking(session)}>
                        <BookmarkXIcon className="w-4 h-4" />
                        Cancel Booking
                      </Button>
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
            {search ? 'No bookings found matching your search.' : 'You have no booked sessions.'}
          </p>
        </div>
      )}
    </div>
  )
}
