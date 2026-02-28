import { getRoomsWithSchedule } from '@/features/rooms'
import { RoomsController } from '@/features/rooms/components/rooms-controller'

export const dynamic = 'force-dynamic'

export default async function RoomsPage() {
  const rooms = await getRoomsWithSchedule()
  return <RoomsController data={rooms} />
}
