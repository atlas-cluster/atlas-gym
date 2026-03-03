import { format } from 'date-fns'
import { BookmarkIcon, CalendarIcon, ClockIcon, MapPinIcon } from 'lucide-react'

import { CourseBookingDisplay, CourseSessionDisplay } from '@/features/courses'
import { Badge } from '@/features/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'

interface TodayScheduleCardProps {
  bookings: CourseBookingDisplay[]
  sessions: CourseSessionDisplay[]
  isTrainer: boolean
}

function formatTime(time: string | Date): string {
  if (typeof time === 'string') {
    return time.slice(0, 5)
  }
  return format(time, 'HH:mm')
}

export function TodayScheduleCard({
  bookings,
  sessions,
  isTrainer,
}: TodayScheduleCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-muted-foreground" />
          Today&apos;s Schedule
        </CardTitle>
        <CardDescription>
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-4">
        {isTrainer && sessions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              My Sessions
            </p>
            <ul className="space-y-2">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className="flex items-start gap-3 rounded-md border p-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {session.name}
                      {session.isCancelled && (
                        <Badge variant="destructive" className="ml-2">
                          Cancelled
                        </Badge>
                      )}
                    </p>
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
                      <span className="flex items-center gap-1">
                        <BookmarkIcon className="size-3" />
                        {session.bookingCount} booked
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            My Bookings
          </p>
          {bookings.length > 0 ? (
            <ul className="space-y-2">
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-start gap-3 rounded-md border p-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {booking.name}
                      {booking.isCancelled && (
                        <Badge variant="destructive" className="ml-2">
                          Cancelled
                        </Badge>
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="size-3" />
                        {formatTime(booking.startTime)} –{' '}
                        {formatTime(booking.endTime)}
                      </span>
                      {booking.roomName && (
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="size-3" />
                          {booking.roomName}
                        </span>
                      )}
                      {booking.trainerName && (
                        <span className="text-muted-foreground">
                          {booking.trainerName}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center rounded-md border border-dashed">
              No bookings for today
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
