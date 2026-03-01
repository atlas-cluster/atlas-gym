import { getMyBookings } from '@/features/courses/actions/get-my-bookings'
import { BookingsController } from '@/features/courses/components/bookings-controller'

export const dynamic = 'force-dynamic'

export default async function ReservationsPage() {
  const bookings = await getMyBookings()

  return <BookingsController data={bookings} />
}
