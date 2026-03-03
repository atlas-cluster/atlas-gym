'use client'

import {
  CalendarPlusIcon,
  Dumbbell,
  LoaderIcon,
  MapPinIcon,
  UserIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { createBooking } from '@/features/courses'
import type { DashboardCourse } from '@/features/dashboard/types'
import { BannerImage } from '@/features/shared/components/banner-image'

interface RecommendedCourseItemProps {
  course: DashboardCourse
}

export function RecommendedCourseItem({ course }: RecommendedCourseItemProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const weekdayLabels = course.weekdays.map(
    (d) => d.charAt(0).toUpperCase() + d.slice(1, 3)
  )

  const handleBook = () => {
    if (!course.nextSessionId || isPending) return

    startTransition(() => {
      const promise = createBooking(course.nextSessionId!).then((r) => {
        if (!r.success) throw new Error(r.message)
        router.refresh()
        return r
      })
      toast.promise(promise, {
        loading: `Booking ${course.name}...`,
        success: (r) => r.message,
        error: (err) => err?.message || 'Failed to book',
      })
    })
  }

  const canBook = !!course.nextSessionId

  return (
    <button
      type="button"
      onClick={canBook ? handleBook : undefined}
      disabled={isPending || !canBook}
      className="group relative flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors hover:border-primary/50 disabled:cursor-default disabled:hover:border-border">
      {/* Hover overlay */}
      {canBook && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            {isPending ? (
              <LoaderIcon className="h-5 w-5 animate-spin" />
            ) : (
              <CalendarPlusIcon className="h-5 w-5" />
            )}
            <span>{isPending ? 'Booking...' : 'Book Next Session'}</span>
          </div>
          {course.nextSessionDate && (
            <span className="absolute bottom-2 text-xs text-muted-foreground">
              {course.nextSessionDate}
            </span>
          )}
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
        <div className="font-medium text-sm truncate">{course.name}</div>
        <div className="text-muted-foreground text-xs mt-0.5">
          {weekdayLabels.join(', ')} · {course.startTime}–{course.endTime}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-muted-foreground text-xs">
          {course.trainerName && (
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
