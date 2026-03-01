'use client'

import { CourseBookingDisplay } from '@/features/courses'
import { BookingsDataTable } from '@/features/courses/components/bookings-data-table'

export function BookingsController({ data }: { data: CourseBookingDisplay[] }) {
  return <BookingsDataTable data={data} />
}
