'use client'

import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  RefreshCwIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon,
} from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

import { RoomWithSchedule, getRoomsWithSchedule } from '@/features/rooms'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import { Input } from '@/features/shared/components/ui/input'
import { Separator } from '@/features/shared/components/ui/separator'

interface RoomsViewProps {
  initialData: RoomWithSchedule[]
}

export function RoomsView({ initialData }: RoomsViewProps) {
  const [isPending, startTransition] = useTransition()
  const [rooms, setRooms] = useState<RoomWithSchedule[]>(initialData)
  const [filterDate, setFilterDate] = useState(
    () => new Date().toISOString().split('T')[0]
  )
  const [filterTime, setFilterTime] = useState(
    () => new Date().toTimeString().slice(0, 5)
  )

  useEffect(() => {
    setRooms(initialData)
  }, [initialData])

  const onRefresh = () => {
    startTransition(async () => {
      const result = await getRoomsWithSchedule(filterDate, filterTime)
      setRooms(result)
    })
  }

  const handleApplyFilter = () => {
    startTransition(async () => {
      const result = await getRoomsWithSchedule(filterDate, filterTime)
      setRooms(result)
    })
  }

  function formatTime(time: string) {
    return time.slice(0, 5)
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            className="w-44"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            suppressHydrationWarning
          />
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-muted-foreground" />
          <Input
            type="time"
            className="w-36"
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            suppressHydrationWarning
          />
        </div>

        <ButtonGroup>
          <Button
            variant="outline"
            type="button"
            suppressHydrationWarning
            onClick={handleApplyFilter}
            disabled={isPending}>
            Apply
          </Button>
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

      {rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {room.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={room.isAvailableNow ? 'default' : 'secondary'}
                      className="flex items-center gap-1">
                      {room.isAvailableNow ? (
                        <>
                          <CheckCircleIcon className="w-3 h-3" />
                          Available
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-3 h-3" />
                          In Use
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <UsersIcon className="w-3 h-3" />
                  Capacity: {room.capacity}
                </div>
              </CardHeader>
              <CardContent>
                {room.sessions.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Schedule for {formatDate(new Date(filterDate))}
                    </p>
                    <Separator />
                    <div className="space-y-2">
                      {room.sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-2 rounded-md border text-sm ${
                            session.isCancelled
                              ? 'opacity-50 line-through'
                              : 'bg-muted/30'
                          }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{session.courseName}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(session.startTime)} – {formatTime(session.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <UserIcon className="w-3 h-3" />
                              {session.trainerName}
                            </div>
                            <div className="flex items-center gap-1">
                              <UsersIcon className="w-3 h-3" />
                              {session.bookedCount} booked
                            </div>
                          </div>
                          {session.isCancelled && (
                            <Badge variant="destructive" className="mt-1 text-xs">
                              Cancelled
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No sessions scheduled for this day.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No rooms available.</p>
        </div>
      )}
    </div>
  )
}
