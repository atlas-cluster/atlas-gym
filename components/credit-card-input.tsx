'use client'

import { useId } from 'react'
import { CreditCardIcon } from 'lucide-react'
import { usePaymentInputs } from 'react-payment-inputs'
import images, { type CardImages } from 'react-payment-inputs/images'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface CreditCardInputProps {
  onChange: (value: string) => void
  onBlur: () => void
  value: string | undefined
  name: string
  error?: FieldError
}

export function CreditCardInput({
                                  onChange,
                                  onBlur,
                                  value,
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

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    getCardNumberProps().onChange(e)
    onChange(e.target.value)
  }

  return (
    <div {...wrapperProps} className="w-full space-y-2">
      <Label htmlFor={`number-${id}`}>Card details</Label>
      <div>
        <div className="relative focus-within:z-10">
          <Input
            {...getCardNumberProps({
              onChange: handleCardNumberChange,
              onBlur: onBlur,
              value: value,
            })}
            id={`number-${id}`}
            name={name}
            className={cn('peer rounded-b-none pr-9 shadow-none', {
              'border-destructive': !!error,
            })}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 text-muted-foreground peer-disabled:opacity-50">
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
              {...getExpiryDateProps()}
              id={`expiry-${id}`}
              className={cn('rounded-r-none rounded-t-none shadow-none', {
                'border-destructive': meta.erroredInputs.expiryDate,
              })}
            />
          </div>
          <div className="-ms-px min-w-0 flex-1 focus-within:z-10">
            <Input
              {...getCVCProps()}
              id={`cvc-${id}`}
              className={cn('rounded-l-none rounded-t-none shadow-none', {
                'border-destructive': meta.erroredInputs.cvc,
              })}
            />
          </div>
        </div>
      </div>
      {meta.error && (
        <p className="text-sm font-medium text-destructive">{meta.error}</p>
      )}
    </div>
  )
}
