'use client'

import { useState } from 'react'

import { useAuth } from '@/features/auth'
import { RoomWithSchedule } from '@/features/rooms'
import { RoomsView } from '@/features/rooms/components/rooms-view'
import { DeleteRoomDialog } from '@/features/rooms/dialogs/delete-room'
import { UpdateRoomDetailsDialog } from '@/features/rooms/dialogs/update-room-details'
import { Room } from '@/features/rooms/types'

interface RoomsControllerProps {
  data: RoomWithSchedule[]
}

export function RoomsController({ data }: RoomsControllerProps) {
  const { member } = useAuth()
  const isTrainer = !!member?.isTrainer

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomWithSchedule | null>(null)

  const handleCreate = isTrainer ? () => setCreateOpen(true) : undefined
  const handleEdit = isTrainer
    ? (room: RoomWithSchedule) => {
        setSelectedRoom(room)
        setEditOpen(true)
      }
    : undefined
  const handleDelete = isTrainer
    ? (room: RoomWithSchedule) => {
        setSelectedRoom(room)
        setDeleteOpen(true)
      }
    : undefined

  return (
    <>
      <RoomsView
        initialData={data}
        onCreateRoom={handleCreate}
        onEditRoom={handleEdit}
        onDeleteRoom={handleDelete}
      />
      {isTrainer && (
        <>
          <UpdateRoomDetailsDialog
            room={null}
            open={createOpen}
            onOpenChange={setCreateOpen}
          />
          <UpdateRoomDetailsDialog
            room={selectedRoom as Room | null}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
          <DeleteRoomDialog
            room={selectedRoom as Room | null}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
          />
        </>
      )}
    </>
  )
}
