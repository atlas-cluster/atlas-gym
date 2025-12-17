'use client'
import {
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
import { loginSchema } from '@/lib/schemas'
import { z } from 'zod'
import { apiClient, ApiError } from '@/lib/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function AuthForm({
  className,
  redirectTo = '/',
  ...props
}: ComponentProps<'div'> & { redirectTo?: string }) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { setError } = form

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
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
          </FieldGroup>
        </CardContent>
        <CardFooter className={'mt-6'}>
          <Button type="submit" className={'w-full'} disabled={loading}>
            Login
          </Button>
        </CardFooter>
      </form>
    </>
  )
}
