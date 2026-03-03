'use client'

import { format } from 'date-fns'
import { BookmarkIcon, ClockIcon, MapPinIcon, SparklesIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { CourseSessionDisplay, createBooking } from '@/features/courses'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/features/shared/components/ui/alert-dialog'
import { Button } from '@/features/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'

const MAX_SHOWN = 3

interface RecommendedCoursesCardProps {
  sessions: CourseSessionDisplay[]
}

function formatTime(time: Date): string {
  return format(time, 'HH:mm')
}

export function RecommendedCoursesCard({
  sessions: initialSessions,
}: RecommendedCoursesCardProps) {
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set())
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [confirmSession, setConfirmSession] =
    useState<CourseSessionDisplay | null>(null)

  const visibleSessions = initialSessions
    .filter((s) => !bookedIds.has(s.id))
    .slice(0, MAX_SHOWN)

  const handleBook = (session: CourseSessionDisplay) => {
    setConfirmSession(null)
    setPendingId(session.id)
    const promise = createBooking(session.id)
      .then((r) => {
        if (!r.success) throw new Error(r.message)
        setBookedIds((prev) => new Set([...prev, session.id]))
        return r
      })
      .finally(() => setPendingId(null))
    toast.promise(promise, {
      loading: 'Booking session...',
      success: (r) => r.message,
      error: (err: Error) => err?.message || 'Failed to book',
    })
  }

  return (
    <>
      <AlertDialog
        open={!!confirmSession}
        onOpenChange={(open) => !open && setConfirmSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm booking</AlertDialogTitle>
            <AlertDialogDescription>
              Book{' '}
              <span className="font-medium text-foreground">
                {confirmSession?.name}
              </span>{' '}
              at{' '}
              {confirmSession &&
                `${formatTime(confirmSession.startTime)} – ${formatTime(confirmSession.endTime)}`}
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmSession && handleBook(confirmSession)}>
              Book
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="flex flex-col h-full overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-muted-foreground" />
            Recommended Today
          </CardTitle>
          <CardDescription>
            Available courses you can still book today
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-2">
          {visibleSessions.length > 0 ? (
            visibleSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 rounded-md border p-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{session.name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-muted-foreground text-xs">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="size-3" />
                      {formatTime(session.startTime)} –{' '}
                      {formatTime(session.endTime)}
                    </span>
                    {session.roomName && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="size-3" />
                        {session.roomName}
                      </span>
                    )}
                    {session.trainerName && <span>{session.trainerName}</span>}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pendingId === session.id}
                  onClick={() => setConfirmSession(session)}>
                  <BookmarkIcon className="size-3.5" />
                  Book
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center rounded-md border border-dashed">
              You&apos;ve booked all available courses today!
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/courses">Browse All Courses</Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
