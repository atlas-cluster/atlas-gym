'use client'

import { ChevronDownIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  MemberDisplay,
  memberDetailsSchema,
  updateMemberDetails,
} from '@/features/members'
import { Button } from '@/features/shared/components/ui/button'
import { Calendar } from '@/features/shared/components/ui/calendar'
import { Dialog, DialogHeader } from '@/features/shared/components/ui/dialog'
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

interface UpdateMemberDetailsDialogProps {
  member: MemberDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UpdateMemberDetailsDialog({
  member,
  open,
  onOpenChange: setOpen,
  onSuccess,
}: UpdateMemberDetailsDialogProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

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
    if (open && member) {
      form.reset({
        firstname: member.firstname,
        middlename: member.middlename ?? '',
        lastname: member.lastname,
        email: member.email,
        phone: member.phone,
        address: member.address,
        birthdate: member.birthdate
          ? new Date(member.birthdate).toISOString().split('T')[0]
          : '',
      })
    }
  }, [form, member, open])

  function onUpdate(data: z.infer<typeof memberDetailsSchema>) {
    if (!member) {
      toast.error('No member selected for update')
      return
    }

    setIsPending(true)
    const promise = updateMemberDetails(member.id, data, member.updatedAt)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to update member')
        }
        setOpen(false)
        onSuccess?.()
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Updating member...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to update member',
    })
  }

  const handleSubmit = (data: z.infer<typeof memberDetailsSchema>) => {
    onUpdate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={'max-h-[90vh] overflow-y-auto'}>
        <DialogHeader>
          <DialogTitle>Edit Member Details</DialogTitle>
          <DialogDescription>
            Update personal and contact information.
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
          </FieldGroup>
          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              type={'button'}
              onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              Update Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
