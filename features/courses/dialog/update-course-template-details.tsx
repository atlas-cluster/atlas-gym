'use client'

import { ChevronDownIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { CourseTemplateDisplay, Weekday } from '@/features/courses'
import { createCourseTemplate } from '@/features/courses/actions/create-course-template'
import { RoomOption } from '@/features/courses/actions/get-room-options'
import { TrainerOption } from '@/features/courses/actions/get-trainer-options'
import { updateCourseTemplate } from '@/features/courses/actions/update-course-template'
import { courseTemplateSchema } from '@/features/courses/schemas/course-template'
import { Button } from '@/features/shared/components/ui/button'
import { Calendar } from '@/features/shared/components/ui/calendar'
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
import { Label } from '@/features/shared/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/features/shared/components/ui/popover'
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

const ALL_WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
]

interface UpdateCourseTemplateDialogProps {
  courseTemplate: CourseTemplateDisplay | null
  trainers: TrainerOption[]
  rooms: RoomOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateCourseTemplateDialog({
  courseTemplate,
  trainers,
  rooms,
  open,
  onOpenChange: setOpen,
}: UpdateCourseTemplateDialogProps) {
  const isEditing = !!courseTemplate
  const [isPending, setIsPending] = useState(false)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  const form = useForm<z.infer<typeof courseTemplateSchema>>({
    resolver: zodResolver(courseTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      bannerImageUrl: '',
      trainerId: '',
      roomId: undefined,
      weekDays: [],
      startTime: '',
      endTime: '',
      startDate: '',
      endDate: undefined,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        courseTemplate
          ? {
              name: courseTemplate.name,
              description: courseTemplate.description ?? '',
              bannerImageUrl: courseTemplate.bannerImageUrl ?? '',
              trainerId: courseTemplate.trainerId ?? '',
              roomId: courseTemplate.roomId ?? undefined,
              weekDays: courseTemplate.weekDays,
              startTime: courseTemplate.startTime.slice(0, 5),
              endTime: courseTemplate.endTime.slice(0, 5),
              startDate: new Date(courseTemplate.startDate)
                .toISOString()
                .split('T')[0],
              endDate: courseTemplate.endDate
                ? new Date(courseTemplate.endDate).toISOString().split('T')[0]
                : undefined,
            }
          : {
              name: '',
              description: '',
              bannerImageUrl: '',
              trainerId: '',
              roomId: undefined,
              weekDays: [],
              startTime: '',
              endTime: '',
              startDate: '',
              endDate: undefined,
            }
      )
    }
  }, [open, courseTemplate, form])

  function onCreate(data: z.infer<typeof courseTemplateSchema>) {
    setIsPending(true)
    const promise = createCourseTemplate(data)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to create course')
        }
        setOpen(false)
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Creating course...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to create course',
    })
  }

  function onUpdate(
    id: string,
    data: z.infer<typeof courseTemplateSchema>,
    lastUpdatedAt: Date
  ) {
    setIsPending(true)
    const promise = updateCourseTemplate(id, data, lastUpdatedAt)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to update course')
        }
        setOpen(false)
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Updating course...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to update course',
    })
  }

  const handleSubmit = (data: z.infer<typeof courseTemplateSchema>) => {
    if (isEditing && courseTemplate) {
      onUpdate(courseTemplate.id, data, courseTemplate.updatedAt)
    } else {
      onCreate(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-137.5">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Course' : 'Create Course'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the course details below.'
              : 'Create a new recurring course.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id="course-template-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-3">
          <FieldGroup>
            {/* Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="ct-name">
                    <span>
                      Name<sup className="text-destructive">*</sup>
                    </span>
                  </FieldLabel>
                  <Input
                    id="ct-name"
                    placeholder="e.g., Morning Yoga"
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="ct-description">Description</FieldLabel>
                  <Textarea
                    id="ct-description"
                    placeholder="Describe the course..."
                    {...field}
                    value={field.value ?? ''}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    rows={2}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Banner Image URL */}
            <Controller
              name="bannerImageUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="ct-banner-image-url">
                    Banner Image URL
                  </FieldLabel>
                  <Input
                    id="ct-banner-image-url"
                    placeholder="https://example.com/image.jpg"
                    {...field}
                    value={field.value ?? ''}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Trainer & Room */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                name="trainerId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      <span>
                        Trainer<sup className="text-destructive">*</sup>
                      </span>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
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
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="roomId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Room</FieldLabel>
                    <Select
                      value={field.value ?? '__none__'}
                      onValueChange={(val) =>
                        field.onChange(val === '__none__' ? undefined : val)
                      }>
                      <SelectTrigger
                        className={cn(
                          'w-full',
                          fieldState.invalid && 'border-destructive!'
                        )}>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No room</SelectItem>
                        {rooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Weekdays */}
            <Controller
              name="weekDays"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    <span>
                      Weekdays<sup className="text-destructive">*</sup>
                    </span>
                  </FieldLabel>
                  <div className="flex flex-wrap gap-3">
                    {ALL_WEEKDAYS.map((day) => {
                      const checked = (field.value ?? []).includes(day.value)
                      return (
                        <div
                          key={day.value}
                          className="flex items-center gap-1.5">
                          <Checkbox
                            id={`weekday-${day.value}`}
                            checked={checked}
                            onCheckedChange={(c) => {
                              const current = field.value ?? []
                              field.onChange(
                                c
                                  ? [...current, day.value]
                                  : current.filter(
                                      (d: Weekday) => d !== day.value
                                    )
                              )
                            }}
                          />
                          <Label
                            htmlFor={`weekday-${day.value}`}
                            className="text-sm">
                            {day.label}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Times */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                name="startTime"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ct-start-time">
                      <span>
                        Start Time<sup className="text-destructive">*</sup>
                      </span>
                    </FieldLabel>
                    <Input
                      id="ct-start-time"
                      type="time"
                      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="endTime"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ct-end-time">
                      <span>
                        End Time<sup className="text-destructive">*</sup>
                      </span>
                    </FieldLabel>
                    <Input
                      id="ct-end-time"
                      type="time"
                      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                name="startDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      <span>
                        Start Date<sup className="text-destructive">*</sup>
                      </span>
                    </FieldLabel>
                    <Popover
                      open={startDateOpen}
                      onOpenChange={setStartDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-between font-normal',
                            fieldState.error && 'border-destructive!'
                          )}>
                          {field.value
                            ? String(field.value).split('-').reverse().join('.')
                            : 'Select date'}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value
                              ? new Date(String(field.value))
                              : undefined
                          }
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            if (date) {
                              const offset = date.getTimezoneOffset() * 60000
                              const adjusted = new Date(date.getTime() - offset)
                              field.onChange(
                                adjusted.toISOString().split('T')[0]
                              )
                            } else {
                              field.onChange('')
                            }
                            setStartDateOpen(false)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="endDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>End Date</FieldLabel>
                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-between font-normal',
                            fieldState.error && 'border-destructive!'
                          )}>
                          {field.value
                            ? String(field.value).split('-').reverse().join('.')
                            : 'No end date'}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value
                              ? new Date(String(field.value))
                              : undefined
                          }
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            if (date) {
                              const offset = date.getTimezoneOffset() * 60000
                              const adjusted = new Date(date.getTime() - offset)
                              field.onChange(
                                adjusted.toISOString().split('T')[0]
                              )
                            } else {
                              field.onChange(undefined)
                            }
                            setEndDateOpen(false)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
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
              {isEditing ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
