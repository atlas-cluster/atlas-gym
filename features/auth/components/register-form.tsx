'use client'

import { ChevronDownIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useHookFormMask } from 'use-mask-input'
import { z } from 'zod'

import { checkEmail } from '@/features/auth/actions/check-email'
import { register } from '@/features/auth/actions/register'
import { useAuth } from '@/features/auth/components/auth-provider'
import { registerSchema } from '@/features/auth/schemas/register'
import { Button } from '@/features/shared/components/ui/button'
import { Calendar } from '@/features/shared/components/ui/calendar'
import {
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import { CreditCardInput } from '@/features/shared/components/ui/credit-card-input'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/shared/components/ui/tabs'
import { cn } from '@/features/shared/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { defineStepper } from '@stepperize/react'

const { useStepper, steps, utils } = defineStepper(
  {
    id: 'account',
    title: 'Join Atlas Gym',
    description: 'Enter your email below to create your account',
  },
  {
    id: 'personal',
    title: 'Personal',
    description: 'Your personal information',
  },
  {
    id: 'contact',
    title: 'Contact',
    description: 'Contact details',
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Payment information',
  }
)

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshMember } = useAuth()
  const stepper = useStepper()
  const currentIndex = utils.getIndex(stepper.current.id)
  const [loading, setLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      repeatPassword: '',
      firstname: '',
      middlename: '',
      lastname: '',
      birthdate: '',
      phone: '',
      address: '',
      paymentType: 'credit_card',
      cardNumber: '',
      cardHolder: '',
      cardExpiry: '',
      cardCvc: '',
      iban: '',
    },
  })

  const {
    setError,
    formState: { errors },
  } = form

  const registerWithMask = useHookFormMask(form.register)

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof z.infer<typeof registerSchema>)[] = []

    switch (stepper.current.id) {
      case 'account':
        fieldsToValidate = ['email', 'password', 'repeatPassword']
        break
      case 'personal':
        fieldsToValidate = ['firstname', 'middlename', 'lastname', 'birthdate']
        break
      case 'contact':
        fieldsToValidate = ['phone', 'address']
        break
      case 'payment':
        const type = form.getValues('paymentType')
        if (type === 'credit_card') {
          fieldsToValidate = [
            'paymentType',
            'cardHolder',
            'cardNumber',
            'cardExpiry',
            'cardCvc',
          ]
        } else {
          fieldsToValidate = ['paymentType', 'iban']
        }
        break
    }

    const result = await form.trigger(fieldsToValidate)

    // For the account step, also check if email exists
    if (result && stepper.current.id === 'account') {
      const email = form.getValues('email')
      try {
        const response = await checkEmail(email)
        if (!response.success) {
          switch (response.errorType) {
            case 'EMAIL_ALREADY_EXISTS':
              setError('email', {
                type: 'server',
                message: 'Email already exists',
              })
              return false
            case 'VALIDATION':
              setError('email', {
                type: 'server',
                message: 'Invalid email address',
              })
              return false
            default:
              toast.error('Error validating email. Please try again.')
              return false
          }
        }
      } catch (err) {
        console.error('Error checking email:', err)
        toast.error('Error validating email. Please try again.')
        return false
      }
    }

    return result
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid) {
      setIsTransitioning(true)
      stepper.next()
      setTimeout(() => setIsTransitioning(false), 100)
    }
  }

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    if (loading || isTransitioning) return

    setLoading(true)

    // Clean IBAN (remove spaces)
    if (data.paymentType === 'iban' && data.iban) {
      data.iban = data.iban.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    }

    const result = await register(data)

    if (!result.success) {
      switch (result.errorType) {
        case 'EMAIL_ALREADY_EXISTS':
          setError('email', { type: 'server', message: 'Email already exists' })
          break
        case 'VALIDATION':
          toast.error('Invalid input. Please check your data and try again.')
          break
        default:
          toast.error('Something went wrong. Please try again.')
      }
    } else {
      await refreshMember()
      toast.success('Account created successfully!')
      const redirect = searchParams.get('redirect')
      router.push(redirect || '/dashboard')
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (target.role === 'combobox') return
    const isInput = target.tagName === 'INPUT'

    if (e.key === 'Enter' && !stepper.isLast && isInput) {
      e.preventDefault()
      handleNext()
    }
  }

  return (
    <>
      <form
        id="register"
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={handleKeyDown}>
        <CardHeader>
          <CardTitle>{stepper.current.title}</CardTitle>
          <CardDescription>{stepper.current.description}</CardDescription>
          <CardAction>
            <span className={'text-muted-foreground text-xs'}>
              {currentIndex + 1} / {steps.length}
            </span>
          </CardAction>
        </CardHeader>
        <CardContent className={'mt-4'}>
          <FieldGroup>
            {stepper.current.id === 'account' && (
              <>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">
                        <span>
                          Email<sup className={'text-destructive'}>*</sup>
                        </span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="mail@example.com"
                        autoComplete="off"
                        onChange={(e) => {
                          if (fieldState.error) {
                            form.clearErrors('email')
                          }
                          form.setValue('email', e.target.value, {
                            shouldValidate: false,
                          })
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">
                        <span>
                          Password<sup className={'text-destructive'}>*</sup>
                        </span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="password"
                        aria-invalid={fieldState.invalid}
                        type="password"
                        autoComplete="off"
                        onChange={(e) => {
                          if (fieldState.error) {
                            form.clearErrors('password')
                          }
                          form.setValue('password', e.target.value, {
                            shouldValidate: false,
                          })
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="repeatPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="repeatPassword">
                        <span>
                          Repeat Password
                          <sup className={'text-destructive'}>*</sup>
                        </span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="repeatpassword"
                        aria-invalid={fieldState.invalid}
                        type="password"
                        autoComplete="off"
                        onChange={(e) => {
                          if (fieldState.error) {
                            form.clearErrors('repeatPassword')
                          }
                          form.setValue('repeatPassword', e.target.value, {
                            shouldValidate: false,
                          })
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </>
            )}

            {stepper.current.id === 'personal' && (
              <>
                <Controller
                  name="firstname"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="firstname">
                        <span>
                          First Name<sup className={'text-destructive'}>*</sup>
                        </span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="firstname"
                        aria-invalid={fieldState.invalid}
                        placeholder={'John'}
                        autoComplete="off"
                        onChange={(e) => {
                          if (fieldState.error) {
                            form.clearErrors('firstname')
                          }
                          form.setValue('firstname', e.target.value, {
                            shouldValidate: false,
                          })
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="middlename"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="middlename">
                        <span>Middle Name</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value || ''}
                        id="middlename"
                        aria-invalid={fieldState.invalid}
                        placeholder="Alan"
                        autoComplete="off"
                        onChange={(e) => {
                          if (fieldState.error) {
                            form.clearErrors('middlename')
                          }
                          form.setValue('middlename', e.target.value, {
                            shouldValidate: false,
                          })
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="lastname"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="lastname">
                        <span>
                          Last Name<sup className={'text-destructive'}>*</sup>
                        </span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="lastname"
                        aria-invalid={fieldState.invalid}
                        placeholder={'Doe'}
                        autoComplete="off"
                        onChange={(e) => {
                          if (fieldState.error) {
                            form.clearErrors('lastname')
                          }
                          form.setValue('lastname', e.target.value, {
                            shouldValidate: false,
                          })
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="birthdate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="birthdate">
                        <span>
                          Birth Date<sup className={'text-destructive'}>*</sup>
                        </span>
                      </FieldLabel>
                      <Popover
                        open={calendarOpen}
                        onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            id="date"
                            className={
                              'w-48 justify-between font-normal ' +
                              cn(!!fieldState.error && 'border-destructive!')
                            }>
                            {field.value
                              ? field.value.split('-').reverse().join('.')
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
                              field.value ? new Date(field.value) : undefined
                            }
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (date) {
                                // Adjust for timezone offset to prevent off-by-one error
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
              </>
            )}

            {stepper.current.id === 'contact' && (
              <>
                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="phone">
                        <span>
                          Phone Number
                          <sup className={'text-destructive'}>*</sup>
                        </span>
                      </FieldLabel>
                      <PhoneInput
                        {...field}
                        id="phone"
                        aria-invalid={fieldState.invalid}
                        placeholder={'+49 123 4567890'}
                        international
                        onChange={(e) => {
                          if (fieldState.error) {
                            form.clearErrors('phone')
                          }
                          form.setValue('phone', e.toString(), {
                            shouldValidate: false,
                          })
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="address"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="address">
                        <span>
                          Address<sup className={'text-destructive'}>*</sup>
                        </span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="address"
                        aria-invalid={fieldState.invalid}
                        placeholder="123 Main St, City, State"
                        autoComplete="off"
                        onChange={(e) => {
                          if (fieldState.error) {
                            form.clearErrors('address')
                          }
                          form.setValue('address', e.target.value, {
                            shouldValidate: false,
                          })
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </>
            )}

            {stepper.current.id === 'payment' && (
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
                  <TabsTrigger value="iban">Iban</TabsTrigger>
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
                        // Optional: trigger validation on blur if desired
                        // form.trigger(['cardNumber', 'cardExpiry', 'cardCvc'])
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
                    {/* Display errors for fields if any, although CreditCardInput highlights borders */}
                    {/* We can optionally show text errors below the component */}
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
            )}
            <Field>
              <div className={'flex w-full justify-end gap-2'}>
                <Button
                  type={'button'}
                  variant={'secondary'}
                  disabled={stepper.isFirst || loading}
                  onClick={stepper.prev}>
                  Back
                </Button>
                {stepper.isLast ? (
                  <Button type={'submit'} disabled={loading || isTransitioning}>
                    {loading ? 'Creating...' : 'Create Account'}
                  </Button>
                ) : (
                  <Button
                    type={'button'}
                    onClick={handleNext}
                    disabled={isTransitioning}>
                    Next
                  </Button>
                )}
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </form>
    </>
  )
}
