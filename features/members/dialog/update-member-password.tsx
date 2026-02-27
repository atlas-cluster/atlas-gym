'use client'

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { MemberDisplay } from '@/features/members'
import { updateMemberPassword } from '@/features/members/actions/update-member-password'
import { memberPasswordSchema } from '@/features/members/schemas/member-password'
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

interface UpdateMemberPasswordDialogProps {
  member: MemberDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UpdateMemberPasswordDialog({
  member,
  open,
  onOpenChange: setOpen,
  onSuccess,
}: UpdateMemberPasswordDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const form = useForm<z.infer<typeof memberPasswordSchema>>({
    resolver: zodResolver(memberPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (open && member) {
      form.reset({
        password: '',
        confirmPassword: '',
      })
    }
  }, [member, form, open])

  function onUpdate(data: z.infer<typeof memberPasswordSchema>) {
    if (!member) {
      toast.error('No member selected for password update')
      return
    }

    setIsPending(true)
    const promise = updateMemberPassword(member.id, data)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to update password')
        }
        setOpen(false)
        onSuccess?.()
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Updating password...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to update password',
    })
  }

  const handleSubmit = (data: z.infer<typeof memberPasswordSchema>) => {
    onUpdate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Password</DialogTitle>
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
          </FieldGroup>
          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              type={'button'}
              onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              Update password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
