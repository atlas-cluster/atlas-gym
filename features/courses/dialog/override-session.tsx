'use client'

import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { CourseSessionDisplay } from '@/features/courses'
import { RoomOption } from '@/features/courses/actions/get-room-options'
import { TrainerOption } from '@/features/courses/actions/get-trainer-options'
import { overrideSession } from '@/features/courses/actions/override-session'
import { sessionOverrideSchema } from '@/features/courses/schemas/session-override'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select'
import { Textarea } from '@/features/shared/components/ui/textarea'
import { cn } from '@/features/shared/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'

interface OverrideSessionDialogProps {
  session: CourseSessionDisplay | null
  trainers: TrainerOption[]
  rooms: RoomOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OverrideSessionDialog({
  session,
  trainers,
  rooms,
  open,
  onOpenChange: setOpen,
}: OverrideSessionDialogProps) {
  const [isPending, setIsPending] = useState(false)

  const form = useForm<z.infer<typeof sessionOverrideSchema>>({
    resolver: zodResolver(sessionOverrideSchema),
    defaultValues: {
      nameOverride: '',
      descriptionOverride: '',
      trainerIdOverride: '',
      roomIdOverride: '',
      startTimeOverride: '',
      endTimeOverride: '',
    },
  })

  const prevOpenRef = useRef(false)

  useEffect(() => {
    const wasOpen = prevOpenRef.current
    prevOpenRef.current = open

    if (open && !wasOpen && session) {
      const hasNameOverride = session.name !== session.originalName
      const hasDescriptionOverride =
        (session.description ?? '') !== (session.originalDescription ?? '')

      form.reset({
        nameOverride: hasNameOverride ? session.name : '',
        descriptionOverride: hasDescriptionOverride
          ? (session.description ?? '')
          : '',
        trainerIdOverride: session.trainerId ?? '',
        roomIdOverride: session.roomId ?? '',
        startTimeOverride: session.startTime,
        endTimeOverride: session.endTime,
      })
    }
  }, [open, session, form])

  const handleSubmit = (data: z.infer<typeof sessionOverrideSchema>) => {
    if (!session) return

    setIsPending(true)
    const promise = overrideSession(session.id, data, session.updatedAt)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to save session')
        }
        setOpen(false)
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to save session',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-137.5">
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
          <DialogDescription>
            Edit session details. Leave fields empty to use the course defaults.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FieldGroup>
            <Controller
              name="nameOverride"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="so-name">Name</FieldLabel>
                  <Input
                    id="so-name"
                    placeholder={
                      session?.originalName ?? 'Leave empty for default'
                    }
                    {...field}
                    value={field.value ?? ''}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="descriptionOverride"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="so-desc">Description</FieldLabel>
                  <Textarea
                    id="so-desc"
                    placeholder={
                      session?.originalDescription ?? 'Leave empty for default'
                    }
                    {...field}
                    value={field.value ?? ''}
                    rows={2}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                name="trainerIdOverride"
                control={form.control}
                render={({ field, fieldState }) => {
                  const isOverridden =
                    session &&
                    field.value &&
                    field.value !== session.originalTrainerId
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Trainer</FieldLabel>
                      <Select
                        value={field.value ?? ''}
                        onValueChange={field.onChange}>
                        <SelectTrigger
                          className={cn(
                            'w-full',
                            fieldState.invalid && 'border-destructive!'
                          )}>
                          <SelectValue placeholder="Select trainer" />
                        </SelectTrigger>
                        <SelectContent>
                          {trainers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                              {isOverridden &&
                                t.id === session?.originalTrainerId && (
                                  <span className="text-muted-foreground">
                                    {' '}
                                    (original)
                                  </span>
                                )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )
                }}
              />

              <Controller
                name="roomIdOverride"
                control={form.control}
                render={({ field, fieldState }) => {
                  const isOverridden =
                    session &&
                    field.value &&
                    field.value !== session.originalRoomId
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Room</FieldLabel>
                      <Select
                        value={field.value ?? ''}
                        onValueChange={field.onChange}>
                        <SelectTrigger
                          className={cn(
                            'w-full',
                            fieldState.invalid && 'border-destructive!'
                          )}>
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                              {isOverridden &&
                                r.id === session?.originalRoomId && (
                                  <span className="text-muted-foreground">
                                    {' '}
                                    (original)
                                  </span>
                                )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                name="startTimeOverride"
                control={form.control}
                render={({ field, fieldState }) => {
                  const originalTime =
                    session?.originalStartTime.slice(0, 5) ?? ''
                  const isOverridden =
                    field.value && field.value !== originalTime
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="so-start">
                        Start Time{' '}
                        {isOverridden && (
                          <span className="text-muted-foreground font-normal">
                            (original: {originalTime})
                          </span>
                        )}
                      </FieldLabel>
                      <Input
                        id="so-start"
                        type="time"
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        {...field}
                        value={field.value ?? ''}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )
                }}
              />

              <Controller
                name="endTimeOverride"
                control={form.control}
                render={({ field, fieldState }) => {
                  const originalTime =
                    session?.originalEndTime.slice(0, 5) ?? ''
                  const isOverridden =
                    field.value && field.value !== originalTime
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="so-end">
                        End Time{' '}
                        {isOverridden && (
                          <span className="text-muted-foreground font-normal">
                            (original: {originalTime})
                          </span>
                        )}
                      </FieldLabel>
                      <Input
                        id="so-end"
                        type="time"
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        {...field}
                        value={field.value ?? ''}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )
                }}
              />
            </div>
          </FieldGroup>

          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
