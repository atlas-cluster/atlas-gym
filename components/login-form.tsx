'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { apiClient, ApiError } from '@/lib/api'
import { loginSchema } from '@/lib/schemas'
import { toast } from 'sonner'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Client-side validation
    const validation = loginSchema.safeParse({ email, password })
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0].toString()] = error.message
        }
      })
      setErrors(fieldErrors)
      setLoading(false)
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      await apiClient.login(email, password)
      
      toast.success('Login successful!')
      
      // Redirect to the original page or home
      const redirect = searchParams.get('redirect') || '/'
      router.push(redirect)
    } catch (error) {
      console.error('Login error:', error)
      
      if (error instanceof ApiError) {
        toast.error(error.message)
        setErrors({ general: error.message })
      } else {
        toast.error('An unexpected error occurred')
        setErrors({ general: 'An unexpected error occurred' })
      }
      
      setLoading(false)
    }
  }

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="mail@example.com"
                  required
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <div className="text-sm text-red-600 mt-1">{errors.email}</div>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  required
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <div className="text-sm text-red-600 mt-1">{errors.password}</div>
                )}
              </Field>
              {errors.general && (
                <Field>
                  <div className="text-sm text-red-600">{errors.general}</div>
                </Field>
              )}
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
                <FieldDescription className="text-center">
                  Not a member yet? <a href="/register">Register</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
