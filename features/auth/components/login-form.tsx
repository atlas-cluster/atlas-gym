'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { login } from '@/features/auth/actions/login'
import { loginSchema } from '@/features/auth/schemas/login'
import { Button } from '@/features/shared/components/ui/button'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    if (loading) return
    setLoading(true)

    const result = await login(data)

    if (result?.error) {
      switch (result.error) {
        case 'USER_NOT_FOUND':
          form.setError('email', { message: 'User not found' })
          form.setFocus('email')
          break
        case 'INVALID_CREDENTIALS':
          form.setError('password', { message: 'Invalid password' })
          form.setFocus('password')
          break
        case 'INVALID_INPUT':
          toast.error('Invalid input. Please check your data and try again.')
          break
        default:
          toast.error('Something went wrong. Please try again.')
      }
    } else {
      toast.success('Logged in successfully!')
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <form id="login" onSubmit={form.handleSubmit(onSubmit)}>
      <CardHeader>
        <CardTitle>Login to your Account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
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

          <Field>
            <Button type="submit" disabled={loading}>
              Login
            </Button>
          </Field>
        </FieldGroup>
      </CardContent>
    </form>
  )
}
