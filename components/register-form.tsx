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
import { ComponentProps, Fragment, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema } from '@/lib/schemas'
import { z } from 'zod'
import { apiClient, ApiError } from '@/lib/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
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

export function RegisterForm({
  className,
  redirectTo = '/',
  ...props
}: ComponentProps<'div'> & { redirectTo?: string }) {
  const stepper = useStepper()
  const currentIndex = utils.getIndex(stepper.current.id)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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
      paymentInfo: '',
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
      stepper.next()
    }
  }

  const onSubmit = async (data: z.infer<typeof registrationSchema>) => {
    if (loading) return

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

  return (
    <>
      <form id="register" onSubmit={form.handleSubmit(onSubmit)}>
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
                          field.onChange(e)
                          if (fieldState.error) {
                            form.clearErrors('email')
                          }
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
                          field.onChange(e)
                          if (fieldState.error) {
                            form.clearErrors('password')
                          }
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
                          field.onChange(e)
                          if (fieldState.error) {
                            form.clearErrors('passwordrepeat')
                          }
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
                        placeholder="John"
                        autoComplete="off"
                        onChange={(e) => {
                          field.onChange(e)
                          if (fieldState.error) {
                            form.clearErrors('firstname')
                          }
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
                        placeholder="Michael"
                        autoComplete="off"
                        onChange={(e) => {
                          field.onChange(e)
                          if (fieldState.error) {
                            form.clearErrors('middlename')
                          }
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
                        placeholder="Doe"
                        autoComplete="off"
                        onChange={(e) => {
                          field.onChange(e)
                          if (fieldState.error) {
                            form.clearErrors('lastname')
                          }
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
                      <Input
                        {...field}
                        id="birthdate"
                        type="date"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        onChange={(e) => {
                          field.onChange(e)
                          if (fieldState.error) {
                            form.clearErrors('birthdate')
                          }
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

            {stepper.current.id === 'contact' && (
              <>
                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="phone">
                        <span>Phone Number</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="phone"
                        aria-invalid={fieldState.invalid}
                        placeholder="+1 (555) 123-4567"
                        autoComplete="off"
                        onChange={(e) => {
                          field.onChange(e)
                          if (fieldState.error) {
                            form.clearErrors('phone')
                          }
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
                        <span>Address</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="address"
                        aria-invalid={fieldState.invalid}
                        placeholder="123 Main St, City, State"
                        autoComplete="off"
                        onChange={(e) => {
                          field.onChange(e)
                          if (fieldState.error) {
                            form.clearErrors('address')
                          }
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
              <>
                <Controller
                  name="paymentType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="paymentType">
                        <span>Payment Type</span>
                      </FieldLabel>
                      <select
                        {...field}
                        id="paymentType"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        aria-invalid={fieldState.invalid}
                        onChange={(e) => {
                          field.onChange(e)
                          if (fieldState.error) {
                            form.clearErrors('paymentType')
                          }
                        }}>
                        <option value="credit_card">Credit Card</option>
                        <option value="iban">IBAN</option>
                      </select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="paymentInfo"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="paymentInfo">
                        <span>Payment Information</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="paymentInfo"
                        aria-invalid={fieldState.invalid}
                        placeholder="Card number or IBAN"
                        autoComplete="off"
                        onChange={(e) => {
                          field.onChange(e)
                          if (fieldState.error) {
                            form.clearErrors('paymentInfo')
                          }
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
              <Button type={'submit'} disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            ) : (
              <Button type={'button'} onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
    </>
  )
}
