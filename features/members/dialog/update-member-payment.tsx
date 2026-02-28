'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useHookFormMask } from 'use-mask-input'
import { z } from 'zod'

import { MemberDisplay, memberPaymentSchema } from '@/features/members'
import { updateMemberPayment } from '@/features/members/actions/update-member-payment'
import { Button } from '@/features/shared/components/ui/button'
import { CreditCardInput } from '@/features/shared/components/ui/credit-card-input'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/shared/components/ui/tabs'
import { useAsyncAction } from '@/features/shared/hooks/use-async-action'
import { zodResolver } from '@hookform/resolvers/zod'

interface UpdateMemberPaymentDialogProps {
  member: MemberDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UpdateMemberPaymentDialog({
  member,
  open,
  onOpenChange: setOpen,
  onSuccess,
}: UpdateMemberPaymentDialogProps) {
  const { isPending, start, stop } = useAsyncAction()
  const form = useForm<z.infer<typeof memberPaymentSchema>>({
    resolver: zodResolver(memberPaymentSchema),
    defaultValues: {
      paymentType: member?.paymentType ?? 'credit_card',
      cardNumber: '',
      cardHolder: '',
      cardExpiry: '',
      cardCvc: '',
      iban: '',
    },
  })

  const {
    formState: { errors },
  } = form

  const registerWithMask = useHookFormMask(form.register)

  useEffect(() => {
    if (open && member) {
      form.reset({
        paymentType: member?.paymentType ?? 'credit_card',
        cardNumber: '',
        cardHolder: '',
        cardExpiry: '',
        cardCvc: '',
        iban: '',
      })
    }
  }, [form, member, open])

  function onUpdate(data: z.infer<typeof memberPaymentSchema>) {
    if (!member) {
      toast.error('No member selected for payment update')
      return
    }

    if (!start()) return
    const promise = updateMemberPayment(member.id, data)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to update payment')
        }
        setOpen(false)
        onSuccess?.()
        return result
      })
      .finally(stop)

    toast.promise(promise, {
      loading: 'Updating payment...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to update payment',
    })
  }

  const handleSubmit = (data: z.infer<typeof memberPaymentSchema>) => {
    onUpdate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={'max-h-[90vh] overflow-y-auto'}>
        <DialogHeader>
          <DialogTitle>Edit Payment Details</DialogTitle>
          <DialogDescription>
            Payment details are not prefilled for security reasons.
          </DialogDescription>
        </DialogHeader>
        <form
          id="member-payment-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className={'space-y-3'}>
          <FieldGroup>
            <Tabs
              value={form.watch('paymentType')}
              onValueChange={(value) => {
                if (value === 'credit_card' || value === 'iban') {
                  form.setValue('paymentType', value)
                  form.clearErrors()
                }
              }}>
              <TabsList>
                <TabsTrigger value="credit_card">Credit Card</TabsTrigger>
                <TabsTrigger value="iban">IBAN</TabsTrigger>
              </TabsList>
              <TabsContent value="credit_card">
                <div className="space-y-4">
                  <Controller
                    name="cardHolder"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="cardHolder">
                          <span>
                            Card Holder Name{' '}
                            <sup className={'text-destructive'}>*</sup>
                          </span>
                        </FieldLabel>
                        <Input
                          {...field}
                          value={field.value || ''}
                          aria-invalid={fieldState.invalid}
                          id="cardHolder"
                          placeholder="John A. Doe"
                          autoComplete="cc-name"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <div className={'h-4'}></div>

                  <CreditCardInput
                    name="credit-card"
                    value={{
                      cardNumber: form.watch('cardNumber') || '',
                      cardExpiry: form.watch('cardExpiry') || '',
                      cardCVC: form.watch('cardCvc') || '',
                    }}
                    onBlur={() => {
                      form.trigger(['cardNumber', 'cardExpiry', 'cardCvc'])
                    }}
                    errors={{
                      cardNumber: errors.cardNumber,
                      cardExpiry: errors.cardExpiry,
                      cardCVC: errors.cardCvc,
                    }}
                    onChange={(value) => {
                      form.setValue('cardNumber', value.cardNumber, {
                        shouldValidate: !!errors.cardNumber,
                      })
                      form.setValue('cardExpiry', value.cardExpiry, {
                        shouldValidate: !!errors.cardExpiry,
                      })
                      form.setValue('cardCvc', value.cardCVC, {
                        shouldValidate: !!errors.cardCvc,
                      })
                    }}
                  />
                  {(errors.cardNumber ||
                    errors.cardExpiry ||
                    errors.cardCvc) && (
                    <div className="text-sm font-medium text-destructive">
                      {errors.cardNumber?.message ||
                        errors.cardExpiry?.message ||
                        errors.cardCvc?.message}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value={'iban'}>
                <Field data-invalid={!!errors.iban}>
                  <FieldLabel htmlFor="iban">
                    <span>
                      IBAN<sup className={'text-destructive'}>*</sup>
                    </span>
                  </FieldLabel>
                  <Input
                    id="iban"
                    aria-invalid={!!errors.iban}
                    placeholder="DE89 3704 0044 0532 0130 00"
                    type="text"
                    autoComplete="off"
                    {...registerWithMask(
                      'iban',
                      ['AA99 **** **** **** **** **** **** ***'],
                      {
                        placeholder: '',
                        showMaskOnHover: false,
                        showMaskOnFocus: false,
                        jitMasking: true,
                      }
                    )}
                  />
                  {errors.iban && <FieldError errors={[errors.iban]} />}
                </Field>
              </TabsContent>
            </Tabs>
          </FieldGroup>
          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              type={'button'}
              onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              Update payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
