'use client'

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createRoom, updateRoom } from '@/features/rooms'
import { roomDetailsSchema } from '@/features/rooms/schemas/room-details'
import { Room } from '@/features/rooms/types'
import { NumberInput } from '@/features/shared/components/number-input'
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
import { zodResolver } from '@hookform/resolvers/zod'

interface UpdateRoomDetailsDialogProps {
  room: Room | null
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
    resolver: zodResolver(roomDetailsSchema),
    defaultValues: {
      name: '',
      capacity: 1,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        room
          ? {
              name: room.name,
              capacity: room.capacity,
            }
          : {
              name: '',
              capacity: 1,
            }
      )
    }
  }, [open, room, form])

  function onCreate(data: z.infer<typeof roomDetailsSchema>) {
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
    data: z.infer<typeof roomDetailsSchema>,
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

  const handleSubmit = (data: z.infer<typeof roomDetailsSchema>) => {
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
              : 'Create a new gym room.'}
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
                    placeholder="e.g., Studio A"
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
              name={'capacity'}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="capacity">Capacity</FieldLabel>
                  <NumberInput
                    {...field}
                    min={1}
                    max={1000}
                    className="w-full"
                    aria-invalid={fieldState.invalid}
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
