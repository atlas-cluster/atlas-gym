'use client'

import { ChevronDownIcon } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { MemberDisplay, memberDetailsSchema } from '@/features/members'
import { Button } from '@/features/shared/components/ui/button'
import { Calendar } from '@/features/shared/components/ui/calendar'
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/features/shared/components/ui/dialog'
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'
import { PhoneInput } from '@/features/shared/components/ui/phone-input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/features/shared/components/ui/popover'
import { cn } from '@/features/shared/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'

interface MemberDetailsDialogProps {
  member?: MemberDisplay
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: (
    data: z.infer<typeof memberDetailsSchema>
  ) => Promise<unknown> | unknown
}

export function MemberDetailsDialog({
  member,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSubmit,
}: MemberDetailsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen
  const isEditing = !!member

  const form = useForm<z.infer<typeof memberDetailsSchema>>({
    resolver: zodResolver(memberDetailsSchema),
    defaultValues: {
      firstname: '',
      middlename: '',
      lastname: '',
      email: '',
      phone: '',
      address: '',
      birthdate: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (member) {
        const birthdate = member.birthdate
          ? new Date(member.birthdate).toISOString().split('T')[0]
          : ''

        form.reset({
          firstname: member.firstname,
          middlename: member.middlename || '',
          lastname: member.lastname,
          email: member.email,
          phone: member.phone || '',
          address: member.address || '',
          birthdate,
        })
      } else {
        form.reset()
      }
    }
  }, [member, form, open])

  async function handleSubmit(data: z.infer<typeof memberDetailsSchema>) {
    setOpen(false)
    await onSubmit?.(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={'max-h-[90vh] overflow-y-auto'}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Member Details' : 'Create Member'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update personal and contact information.'
              : 'Add a new member.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id="member-details-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className={'space-y-3'}>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                name={'firstname'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="firstname">
                      <span>
                        First Name<sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <Input
                      id="firstname"
                      placeholder="John"
                      {...field}
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
                name={'middlename'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="middlename">Middle Name</FieldLabel>
                    <Input
                      id="middlename"
                      placeholder="Alan"
                      {...field}
                      value={field.value ?? ''}
                      aria-invalid={fieldState.invalid}
                      autoComplete={'off'}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                name={'lastname'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lastname">
                      <span>
                        Last Name<sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <Input
                      id="lastname"
                      placeholder="Doe"
                      {...field}
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
                name={'email'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">
                      <span>
                        Email<sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <Input
                      id="email"
                      placeholder="mail@example.com"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete={'off'}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                name={'phone'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone">
                      <span>
                        Phone<sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <PhoneInput
                      id={'phone'}
                      {...field}
                      onChange={field.onChange}
                      defaultCountry={'DE'}
                      international
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name={'birthdate'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="birthdate">
                      <span>
                        Birth Date<sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          id="birthdate"
                          className={
                            'w-48 justify-between font-normal ' +
                            cn(!!fieldState.error && 'border-destructive!')
                          }>
                          {field.value ? field.value : 'Select date'}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            if (date) {
                              const timezoneOffset =
                                date.getTimezoneOffset() * 60000
                              const adjustedDate = new Date(
                                date.getTime() - timezoneOffset
                              )
                              field.onChange(
                                adjustedDate.toISOString().split('T')[0]
                              )
                            } else {
                              field.onChange('')
                            }
                            setCalendarOpen(false)
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

            <Controller
              name={'address'}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="address">
                    <span>
                      Address<sup className={'text-destructive'}>*</sup>
                    </span>
                  </FieldLabel>
                  <Input
                    id="address"
                    placeholder="123 Main St, City"
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete={'off'}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <DialogFooter>
              <Button type="submit">{isEditing ? 'Save' : 'Create'}</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
