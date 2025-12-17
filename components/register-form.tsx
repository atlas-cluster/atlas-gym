'use client'
import {
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { ComponentProps, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema } from '@/lib/schemas'
import { z } from 'zod'
import { apiClient, ApiError } from '@/lib/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { defineStepper } from '@stepperize/react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ChevronDownIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { CreditCardInput } from '@/components/ui/credit-card-input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { PhoneInput } from '@/components/ui/phone-input'

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

export function RegisterForm({
  className,
  redirectTo = '/',
  ...props
}: ComponentProps<'div'> & { redirectTo?: string }) {
  const stepper = useStepper()
  const currentIndex = utils.getIndex(stepper.current.id)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordrepeat: '',
      firstname: '',
      middlename: '',
      lastname: '',
      birthdate: '',
      phone: '',
      address: '',
      paymentType: 'credit_card',
      paymentInfo: { cardNumber: '', cardExpiry: '', cardCVC: '' },
    },
  })

  const { setError } = form

  // Validate current step before allowing to proceed
  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof z.infer<typeof registrationSchema>)[] = []

    switch (stepper.current.id) {
      case 'account':
        fieldsToValidate = ['email', 'password', 'passwordrepeat']
        break
      case 'personal':
        fieldsToValidate = ['firstname', 'middlename', 'lastname', 'birthdate']
        break
      case 'contact':
        fieldsToValidate = ['phone', 'address']
        break
      case 'payment':
        fieldsToValidate = ['paymentType', 'paymentInfo']
        break
    }

    const result = await form.trigger(fieldsToValidate)

    // For the account step, also check if email exists
    if (result && stepper.current.id === 'account') {
      const email = form.getValues('email')
      try {
        const { exists } = await apiClient.checkEmail(email)
        if (exists) {
          setError('email', {
            type: 'server',
            message: 'This email is already registered',
          })
          return false
        }
      } catch (err) {
        console.error('Error checking email:', err)
        // Continue even if check fails to avoid blocking the user
      }
    }

    return result
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid) {
      setIsTransitioning(true)
      stepper.next()
      // Reset transitioning state after a short delay
      setTimeout(() => setIsTransitioning(false), 100)
    }
  }

  const onSubmit = async (data: z.infer<typeof registrationSchema>) => {
    // Prevent submission if we're transitioning between steps
    if (loading || isTransitioning) return

    setLoading(true)

    try {
      await apiClient.register(data)

      toast.success('Registration successful!')
      setLoading(false)

      // Redirect to the original page or home
      router.push(redirectTo)
    } catch (err) {
      if (err instanceof ApiError) {
        // Map server status codes to specific field errors
        if (err.status === 400) {
          // Could be duplicate email or validation error
          if (err.message.toLowerCase().includes('email')) {
            setError('email', { type: 'server', message: err.message })
          } else {
            toast.error(err.message)
          }
        } else {
          toast.error(err.message)
        }
        setLoading(false)
      } else {
        toast.error('An unexpected error occurred')
        setLoading(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle Enter on input elements, not on buttons or selects
    const target = e.target as HTMLElement

    // Fix for combobox (e.g., date picker)
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
        <CardHeader className={className} {...props}>
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
                          // Always update without validation on change
                          // Validation will happen on blur or submit
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
                          // Always update without validation on change
                          // Validation will happen on blur or submit
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
                  name="passwordrepeat"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="passwordrepeat">
                        <span>
                          Repeat Password
                          <sup className={'text-destructive'}>*</sup>
                        </span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="passwordrepeat"
                        aria-invalid={fieldState.invalid}
                        type="password"
                        autoComplete="off"
                        onChange={(e) => {
                          // Always update without validation on change
                          // Validation will happen on blur or submit
                          if (fieldState.error) {
                            form.clearErrors('passwordrepeat')
                          }
                          form.setValue('passwordrepeat', e.target.value, {
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
                        placeholder={"John"}
                        autoComplete="off"
                        onChange={(e) => {
                          // Always update without validation on change
                          // Validation will happen on blur or submit
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
                        id="middlename"
                        aria-invalid={fieldState.invalid}
                        placeholder="Alan"
                        autoComplete="off"
                        onChange={(e) => {
                          // Always update without validation on change
                          // Validation will happen on blur or submit
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
                        placeholder={"Doe"}
                        autoComplete="off"
                        onChange={(e) => {
                          // Always update without validation on change
                          // Validation will happen on blur or submit
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
                        placeholder={"+49 123 4567890"}
                        international
                      onChange={(e) => {
                        // Always update without validation on change
                        // Validation will happen on blur or submit
                        if (fieldState.error) {
                          form.clearErrors('phone')
                        }
                        form.setValue('phone', e.toString(), {
                          shouldValidate: false,
                        })
                      }}/>
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
                          // Always update without validation on change
                          // Validation will happen on blur or submit
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
              <Controller
                name="paymentType"
                control={form.control}
                render={({ field }) => (
                  <Tabs
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      if (value === 'credit_card') {
                        form.setValue('paymentInfo', {
                          cardNumber: '',
                          cardExpiry: '',
                          cardCVC: '',
                        })
                      } else {
                        form.setValue('paymentInfo', { iban: '' })
                      }
                      form.clearErrors('paymentInfo')
                    }}>
                    <TabsList>
                      <TabsTrigger value="credit_card">Credit Card</TabsTrigger>
                      <TabsTrigger value="iban">Iban</TabsTrigger>
                    </TabsList>
                    <TabsContent value="credit_card">
                      <Controller
                        name="paymentInfo"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <CreditCardInput
                              name={field.name}
                              value={
                                typeof field.value === 'object' &&
                                'cardNumber' in field.value
                                  ? field.value
                                  : undefined
                              }
                              onBlur={field.onBlur}
                              error={fieldState.error}
                              onChange={(value) => {
                                // Always update without validation on change
                                // Validation will happen on blur or submit
                                if (fieldState.error) {
                                  form.clearErrors('paymentInfo')
                                }
                                form.setValue('paymentInfo', value, {
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
                    </TabsContent>
                    <TabsContent value={'iban'}>
                      <Controller
                        name="paymentInfo"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="paymentInfo">
                              <span>
                                IBAN<sup className={'text-destructive'}>*</sup>
                              </span>
                            </FieldLabel>
                            <Input
                              id="paymentInfo"
                              aria-invalid={fieldState.invalid}
                              placeholder="DE89 3704 0044 0532 0130 00"
                              autoComplete="off"
                              value={
                                typeof field.value === 'object' &&
                                'iban' in field.value
                                  ? field.value.iban
                                  : ''
                              }
                              onChange={(e) => {
                                const newValue = { iban: e.target.value }
                                // Always update without validation on change
                                // Validation will happen on blur or submit
                                if (fieldState.error) {
                                  form.clearErrors('paymentInfo')
                                }
                                form.setValue('paymentInfo', newValue, {
                                  shouldValidate: false,
                                })
                              }}
                              onBlur={field.onBlur}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                )}
              />
            )}
          </FieldGroup>
        </CardContent>
        <CardFooter className={'mt-6 w-full'}>
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
        </CardFooter>
      </form>
    </>
  )
}
