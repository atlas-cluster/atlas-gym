'use client'

import {
  CheckCircleIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

import { RoomWithSchedule, getRoomsWithSchedule } from '@/features/rooms'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import { Input } from '@/features/shared/components/ui/input'
import { Separator } from '@/features/shared/components/ui/separator'

interface RoomsViewProps {
  initialData: RoomWithSchedule[]
  onCreateRoom?: () => void
  onEditRoom?: (room: RoomWithSchedule) => void
  onDeleteRoom?: (room: RoomWithSchedule) => void
}

export function RoomsView({
  initialData,
  onCreateRoom,
  onEditRoom,
  onDeleteRoom,
}: RoomsViewProps) {
  const [isPending, startTransition] = useTransition()
  const [rooms, setRooms] = useState<RoomWithSchedule[]>(initialData)
  const [filterDate, setFilterDate] = useState(
    () => new Date().toISOString().split('T')[0]
  )
  const [filterTime, setFilterTime] = useState(
    () => new Date().toTimeString().slice(0, 5)
  )
  const defaultDate = new Date().toISOString().split('T')[0]
  const defaultTime = new Date().toTimeString().slice(0, 5)

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

  const hasFilterChanged = filterDate !== defaultDate || filterTime !== defaultTime

  const clearFilters = () => {
    setFilterDate(defaultDate)
    setFilterTime(defaultTime)
    startTransition(async () => {
      const result = await getRoomsWithSchedule(defaultDate, defaultTime)
      setRooms(result)
    })
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex w-full flex-wrap items-center gap-2">
          <Input
            type="date"
            className="w-full md:w-44"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            suppressHydrationWarning
          />
          <Input
            type="time"
            className="w-full md:w-36"
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            suppressHydrationWarning
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
            {hasFilterChanged && (
              <Button
                variant="ghost"
                size="icon"
                type="button"
                suppressHydrationWarning
                onClick={clearFilters}>
                <XIcon />
                <span className="sr-only">Clear filters</span>
              </Button>
            )}
          </ButtonGroup>
          {/* Mobile: refresh + create in same row */}
          <div className="flex gap-2 md:hidden ml-auto">
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
            {onCreateRoom && (
              <Button
                variant="default"
                size="icon"
                type="button"
                suppressHydrationWarning
                onClick={onCreateRoom}>
                <PlusIcon />
                <span className="sr-only">Create Room</span>
              </Button>
            )}
          </div>
        </div>
        {/* Right (desktop only) */}
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
          {onCreateRoom && (
            <Button
              variant="default"
              size="default"
              type="button"
              suppressHydrationWarning
              onClick={onCreateRoom}>
              <PlusIcon />
              <span className="hidden md:inline">Create Room</span>
            </Button>
          )}
        </div>
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
                {(onEditRoom || onDeleteRoom) && (
                  <CardAction>
                    <ButtonGroup>
                      {onEditRoom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          suppressHydrationWarning
                          onClick={() => onEditRoom(room)}>
                          <PencilIcon />
                          <span className="sr-only">Edit room</span>
                        </Button>
                      )}
                      {onDeleteRoom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          suppressHydrationWarning
                          onClick={() => onDeleteRoom(room)}>
                          <TrashIcon />
                          <span className="sr-only">Delete room</span>
                        </Button>
                      )}
                    </ButtonGroup>
                  </CardAction>
                )}
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
