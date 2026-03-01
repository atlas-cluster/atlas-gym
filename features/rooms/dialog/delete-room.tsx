'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { deleteRoom } from '@/features/rooms/actions/delete-room'
import { RoomDisplay } from '@/features/rooms/types'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'

interface DeleteRoomDialogProps {
  room: RoomDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteRoomDialog({
  room,
  open,
  onOpenChange: setOpen,
}: DeleteRoomDialogProps) {
  const [isPending, setIsPending] = useState(false)

  function onDelete(id: string, updatedAt: Date) {
    setIsPending(true)
    const promise = deleteRoom(id, updatedAt)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to delete room')
        }
        setOpen(false)
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Deleting room...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to delete room',
    })
  }

  const onSubmit = () => {
    if (room) {
      onDelete(room.id, room.updatedAt)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this room?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All subscriptions associated with this
            room will also be deleted.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            type="button"
            onClick={onSubmit}
            disabled={isPending}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
