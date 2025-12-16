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

  const onSubmit = async (data: z.infer<typeof registrationSchema>) => {
    if (loading) return

    setLoading(true)

    try {
      await apiClient.login(data.email, data.password)

      toast.success('Login successful!')
      setLoading(false)

      // Redirect to the original page or home
      router.push(redirectTo)
    } catch (err) {
      if (err instanceof ApiError) {
        // Map server status codes to specific field errors
        if (err.status === 404) {
          setError('email', { type: 'server', message: err.message })
        } else if (err.status === 401) {
          setError('password', { type: 'server', message: err.message })
        } else {
          // Fallback: attach to password (or choose a global banner)
          setError('password', { type: 'server', message: err.message })
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
      <form id="login" onSubmit={form.handleSubmit(onSubmit)}>
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
                      Repeat Password<sup className={'text-destructive'}>*</sup>
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="passwordrepeat"
                    aria-invalid={fieldState.invalid}
                    type="password"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
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
              <Button onClick={stepper.next}>Next</Button>
            )}
          </div>
        </CardFooter>
      </form>
    </>
  )
}
