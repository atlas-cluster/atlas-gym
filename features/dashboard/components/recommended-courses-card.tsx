import { format } from 'date-fns'
import { ClockIcon, MapPinIcon, SparklesIcon } from 'lucide-react'
import Link from 'next/link'

import { CourseSessionDisplay } from '@/features/courses'
import { Button } from '@/features/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'

interface RecommendedCoursesCardProps {
  sessions: CourseSessionDisplay[]
}

function formatTime(time: Date): string {
  return format(time, 'HH:mm')
}

export function RecommendedCoursesCard({
  sessions,
}: RecommendedCoursesCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-muted-foreground" />
          Recommended Today
        </CardTitle>
        <CardDescription>
          Available courses you can still book today
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {sessions.length > 0 ? (
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-start gap-3 rounded-md border p-3 text-sm">
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
              </li>
            ))}
          </ul>
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
  )
}
