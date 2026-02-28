import { getRoomsWithSchedule } from '@/features/rooms'
import { RoomsView } from '@/features/rooms/components/rooms-view'

export const dynamic = 'force-dynamic'

export default async function RoomsPage() {
  const rooms = await getRoomsWithSchedule()
  return <RoomsView initialData={rooms} />
}
