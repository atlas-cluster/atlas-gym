'use client'

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createCourseTemplate, getTrainersMinimal, updateCourseTemplate } from '@/features/courses'
import { courseTemplateDetailsSchema } from '@/features/courses/schemas/course-template-details'
import { CourseTemplateDisplay, RoomMinimal, TrainerMinimal, Weekday } from '@/features/courses/types'
import { getRoomsMinimal } from '@/features/rooms'
import { Button } from '@/features/shared/components/ui/button'
import { Checkbox } from '@/features/shared/components/ui/checkbox'
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
import { zodResolver } from '@hookform/resolvers/zod'

const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

interface UpdateCourseTemplateDetailsDialogProps {
  template: CourseTemplateDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateCourseTemplateDetailsDialog({
  template,
  open,
  onOpenChange: setOpen,
}: UpdateCourseTemplateDetailsDialogProps) {
  const isEditing = !!template
  const [isPending, setIsPending] = useState(false)
  const [trainers, setTrainers] = useState<TrainerMinimal[]>([])
  const [rooms, setRooms] = useState<RoomMinimal[]>([])

  const form = useForm<z.infer<typeof courseTemplateDetailsSchema>>({
    resolver: zodResolver(courseTemplateDetailsSchema),
    defaultValues: {
      name: '',
      description: '',
      trainerId: '',
      roomId: '',
      weekdays: [],
      startTime: '09:00',
      endTime: '10:00',
      startDate: '',
      endDate: '',
    },
  })

  useEffect(() => {
    if (open) {
      getTrainersMinimal().then(setTrainers)
      getRoomsMinimal().then(setRooms)

      form.reset(
        template
          ? {
              name: template.name,
              description: template.description ?? '',
              trainerId: template.trainerId,
              roomId: template.roomId,
              weekdays: template.weekdays,
              startTime: template.startTime.slice(0, 5),
              endTime: template.endTime.slice(0, 5),
              startDate: new Date(template.startDate).toISOString().split('T')[0],
              endDate: template.endDate
                ? new Date(template.endDate).toISOString().split('T')[0]
                : '',
            }
          : {
              name: '',
              description: '',
              trainerId: '',
              roomId: '',
              weekdays: [],
              startTime: '09:00',
              endTime: '10:00',
              startDate: '',
              endDate: '',
            }
      )
    }
  }, [open, template, form])

  function onCreate(data: z.infer<typeof courseTemplateDetailsSchema>) {
    setIsPending(true)
    const promise = createCourseTemplate(data)
      .then((result) => {
        if (!result.success) throw new Error(result.message || 'Failed to create template')
        setOpen(false)
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Creating course template...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to create course template',
    })
  }

  function onUpdate(
    id: string,
    data: z.infer<typeof courseTemplateDetailsSchema>,
    lastUpdatedAt: Date
  ) {
    setIsPending(true)
    const promise = updateCourseTemplate(id, data, lastUpdatedAt)
      .then((result) => {
        if (!result.success) throw new Error(result.message || 'Failed to update template')
        setOpen(false)
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Updating course template...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to update course template',
    })
  }

  const handleSubmit = (data: z.infer<typeof courseTemplateDetailsSchema>) => {
    if (isEditing && template) {
      onUpdate(template.id, data, template.updatedAt)
    } else {
      onCreate(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Course Template' : 'Create Course Template'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the course template details below.'
              : 'Create a new course template.'}
          </DialogDescription>
        </DialogHeader>

        <form
          id="course-template-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-3">
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    placeholder="e.g., Morning Yoga"
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    placeholder="Describe the course..."
                    {...field}
                    value={field.value ?? ''}
                    aria-invalid={fieldState.invalid}
                    rows={2}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Controller
                name="trainerId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Trainer</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select trainer" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="roomId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Room</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} (cap. {r.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="weekdays"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Weekdays</FieldLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {WEEKDAYS.map((day) => (
                      <label
                        key={day.value}
                        className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={field.value.includes(day.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, day.value])
                            } else {
                              field.onChange(field.value.filter((d) => d !== day.value))
                            }
                          }}
                        />
                        {day.label}
                      </label>
                    ))}
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Controller
                name="startTime"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="startTime">Start Time</FieldLabel>
                    <Input
                      id="startTime"
                      type="time"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="endTime"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="endTime">End Time</FieldLabel>
                    <Input
                      id="endTime"
                      type="time"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Controller
                name="startDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
                    <Input
                      id="startDate"
                      type="date"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="endDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="endDate">End Date (optional)</FieldLabel>
                    <Input
                      id="endDate"
                      type="date"
                      {...field}
                      value={field.value ?? ''}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isEditing ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
