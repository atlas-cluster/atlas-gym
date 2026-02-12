import { ReactNode, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { MemberDisplay } from '@/features/members'
import { changePasswordSchema } from '@/features/members/schemas/change-password'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/features/shared/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'

interface ChangePasswordDialogProps {
  member?: MemberDisplay
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: (
    data: z.infer<typeof changePasswordSchema>
  ) => Promise<unknown> | unknown
}

export function ChangePasswordDialog({
  member,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSubmit,
}: ChangePasswordDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  // Reset form when dialog opens/closes or member changes
  // Although typically for password change we just want a blank form
  const { reset } = form

  // We might want to reset when the dialog opens.
  // Using useEffect or just letting it remain blank.
  // Since it's a new password everytime, blank is good.

  async function handleSubmit(data: z.infer<typeof changePasswordSchema>) {
    await onSubmit?.(data)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter a new password for {member?.firstname} {member?.lastname}.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className={'space-y-3'}>
          <FieldGroup>
            <Controller
              name={'password'}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">
                    <span>
                      New Password<sup className={'text-destructive'}>*</sup>
                    </span>
                  </FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="******"
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete={'new-password'}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name={'confirmPassword'}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword">
                    <span>
                      Confirm Password
                      <sup className={'text-destructive'}>*</sup>
                    </span>
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="******"
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete={'new-password'}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <DialogFooter>
              <Button type="submit">Change Password</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
