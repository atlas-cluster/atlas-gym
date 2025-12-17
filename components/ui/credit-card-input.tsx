'use client'

import { useId, useState } from 'react'
import { CreditCardIcon } from 'lucide-react'
import { usePaymentInputs } from 'react-payment-inputs'
import images, { type CardImages } from 'react-payment-inputs/images'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface CreditCardInputProps {
  onChange: (value: {
    cardNumber: string
    cardExpiry: string
    cardCVC: string
  }) => void
  onBlur: () => void
  value:
    | { cardNumber?: string; cardExpiry?: string; cardCVC?: string }
    | undefined
  name: string
  error?: FieldError
}

export function CreditCardInput({
  onChange,
  onBlur,
  value = {},
  name,
  error,
}: CreditCardInputProps) {
  const id = useId()
  const {
    meta,
    getCardNumberProps,
    getExpiryDateProps,
    getCVCProps,
    getCardImageProps,
    wrapperProps,
  } = usePaymentInputs()

  // Local state to manage individual field values
  const [cardNumber, setCardNumber] = useState(value?.cardNumber || '')
  const [cardExpiry, setCardExpiry] = useState(value?.cardExpiry || '')
  const [cardCVC, setCardCVC] = useState(value?.cardCVC || '')

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    getCardNumberProps().onChange(e)
    setCardNumber(e.target.value)
    // Trigger onChange immediately to clear errors
    onChange({ cardNumber: e.target.value, cardExpiry, cardCVC })
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    getExpiryDateProps().onChange(e)
    setCardExpiry(e.target.value)
    // Trigger onChange immediately to clear errors
    onChange({ cardNumber, cardExpiry: e.target.value, cardCVC })
  }

  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    getCVCProps().onChange(e)
    setCardCVC(e.target.value)
    // Trigger onChange immediately to clear errors
    onChange({ cardNumber, cardExpiry, cardCVC: e.target.value })
  }

  // Filter out non-DOM props from wrapperProps to avoid React warnings
  const { isTouched, ...domWrapperProps } = wrapperProps

  return (
    <div {...domWrapperProps} className="w-full space-y-2">
      <Label htmlFor={`number-${id}`}>
        Card details<sup className={'text-destructive'}>*</sup>
      </Label>
      <div>
        <div className="relative focus-within:z-10">
          <Input
            {...getCardNumberProps({
              onChange: handleCardNumberChange,
              onBlur: onBlur,
            })}
            value={cardNumber}
            id={`number-${id}`}
            name={name}
            className={cn('peer rounded-b-none pr-9 shadow-none', {
              'border-destructive': !!error,
            })}
          />
          <div className="text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50">
            {meta.cardType ? (
              <svg
                className="w-6 overflow-hidden"
                {...getCardImageProps({
                  images: images as unknown as CardImages,
                })}
              />
            ) : (
              <CreditCardIcon className="size-4" />
            )}
            <span className="sr-only">Card Provider</span>
          </div>
        </div>
        <div className="-mt-px flex">
          <div className="min-w-0 flex-1 focus-within:z-10">
            <Input
              {...getExpiryDateProps({
                onChange: handleExpiryChange,
                onBlur: onBlur,
              })}
              value={cardExpiry}
              id={`expiry-${id}`}
              className={cn('rounded-t-none rounded-r-none shadow-none', {
                'border-destructive': !!error,
              })}
            />
          </div>
          <div className="-ms-px min-w-0 flex-1 focus-within:z-10">
            <Input
              {...getCVCProps({
                onChange: handleCVCChange,
                onBlur: onBlur,
              })}
              value={cardCVC}
              id={`cvc-${id}`}
              className={cn('rounded-t-none rounded-l-none shadow-none', {
                'border-destructive': !!error,
              })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
