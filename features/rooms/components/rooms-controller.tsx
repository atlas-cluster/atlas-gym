'use client'

import { useState } from 'react'

import { RoomsDataTable } from '@/features/rooms/components/rooms-data-table'
import { DeleteRoomDialog } from '@/features/rooms/dialog/delete-room'
import { UpdateRoomDetailsDialog } from '@/features/rooms/dialog/update-room-details'
import { RoomDisplay } from '@/features/rooms/types'

export function RoomsController({ data }: { data: RoomDisplay[] }) {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomDisplay | null>(null)

  function openCreateDialog() {
    setSelectedRoom(null)
    setDetailsDialogOpen(true)
  }

  function openEditDialog(room: RoomDisplay) {
    setSelectedRoom(room)
    setDetailsDialogOpen(true)
  }

  function openDeleteDialog(room: RoomDisplay) {
    setSelectedRoom(room)
    setConfirmDeleteDialogOpen(true)
  }

  return (
    <>
      <RoomsDataTable
        data={data}
        onCreate={openCreateDialog}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

      <UpdateRoomDetailsDialog
        key={selectedRoom?.id ?? 'create'}
        room={selectedRoom}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

      <DeleteRoomDialog
        room={selectedRoom}
        open={confirmDeleteDialogOpen}
        onOpenChange={setConfirmDeleteDialogOpen}
      />
    </>
  )
}
