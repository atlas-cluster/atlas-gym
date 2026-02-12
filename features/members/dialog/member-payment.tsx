import { ReactNode, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useHookFormMask } from 'use-mask-input'
import { z } from 'zod'

import { MemberDisplay, memberPaymentSchema } from '@/features/members'
import { Button } from '@/features/shared/components/ui/button'
import { CreditCardInput } from '@/features/shared/components/ui/credit-card-input'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/shared/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'

interface MemberPaymentDialogProps {
  member?: MemberDisplay
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: (
    data: z.infer<typeof memberPaymentSchema>
  ) => Promise<unknown> | unknown
}

export function MemberPaymentDialog({
  member,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSubmit,
}: MemberPaymentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen
  const isEditing = !!member

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
    if (open) {
      form.reset({
        paymentType: member?.paymentType ?? 'credit_card',
        cardNumber: '',
        cardHolder: '',
        cardExpiry: '',
        cardCvc: '',
        iban: '',
      })
    }
  }, [member, form, open])

  async function handleSubmit(data: z.infer<typeof memberPaymentSchema>) {
    setOpen(false)
    await onSubmit?.(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={'max-h-[90vh] overflow-y-auto'}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Payment' : 'Add Payment'}
          </DialogTitle>
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

            <DialogFooter>
              <Button type="submit">Save Payment</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
