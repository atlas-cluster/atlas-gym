'use client'

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createRoom } from '@/features/rooms/actions/create-room'
import { updateRoom } from '@/features/rooms/actions/update-room'
import { roomSchema } from '@/features/rooms/schemas/room'
import { RoomDisplay } from '@/features/rooms/types'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'
import { Textarea } from '@/features/shared/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'

interface UpdateRoomDetailsDialogProps {
  room: RoomDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateRoomDetailsDialog({
  room,
  open,
  onOpenChange: setOpen,
}: UpdateRoomDetailsDialogProps) {
  const isEditing = !!room
  const [isPending, setIsPending] = useState(false)

  const form = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        room
          ? {
              name: room.name,
              description: room.description ?? '',
            }
          : {
              name: '',
              description: '',
            }
      )
    }
  }, [open, room, form])

  function onCreate(data: z.infer<typeof roomSchema>) {
    setIsPending(true)
    const promise = createRoom(data)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to create room')
        }
        setOpen(false)
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Creating room...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to create room',
    })
  }

  function onUpdate(
    id: string,
    data: z.infer<typeof roomSchema>,
    lastUpdatedAt: Date
  ) {
    setIsPending(true)
    const promise = updateRoom(id, data, lastUpdatedAt)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to update room')
        }
        setOpen(false)
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Updating room...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to update room',
    })
  }

  const handleSubmit = (data: z.infer<typeof roomSchema>) => {
    if (isEditing && room) {
      onUpdate(room.id, data, room.updatedAt)
    } else {
      onCreate(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Room' : 'Create Room'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the room details below.'
              : 'Create a new room by filling out the details below.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id="room-details-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-3">
          <FieldGroup>
            <Controller
              name={'name'}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    placeholder="e.g., Yoga Studio"
                    {...field}
                    value={field.value}
                    aria-invalid={fieldState.invalid}
                    autoComplete={'off'}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name={'description'}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    {...field}
                    placeholder="Describe the room and its purpose"
                    value={field.value}
                    aria-invalid={fieldState.invalid}
                    autoComplete={'off'}
                    rows={3}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              type={'button'}
              onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isEditing ? 'Update Room' : 'Create Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
