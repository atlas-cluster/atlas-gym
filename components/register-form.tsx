'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Card,
    CardAction,
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
import { Button } from '@/components/ui/button'
import { defineStepper } from '@/components/ui/stepper'

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
                                 ...props
                             }: React.ComponentProps<'div'>) {
    const stepper = useStepper()
    const currentIndex = utils.getIndex(stepper.current.id)
    const router = useRouter()
    const [formData, setFormData] = useState<Record<string, string>>({})
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')

        const formDataObj = new FormData(e.currentTarget)
        const data = Object.fromEntries(formDataObj.entries()) as Record<string, string>

        // Merge with previous form data
        const allData = { ...formData, ...data }
        setFormData(allData)

        // Validate password match on account step
        if (currentIndex === 0) {
            if (data.password !== data.passwordrepeat) {
                setError('Passwords do not match')
                return
            }
            if (data.password.length < 8) {
                setError('Password must be at least 8 characters long')
                return
            }
        }

        if (!stepper.isLast) {
            stepper.next()
        } else {
            // Submit registration
            setLoading(true)
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(allData),
                })

                const result = await response.json()

                if (!response.ok) {
                    setError(result.error || 'Registration failed')
                    setLoading(false)
                    return
                }

                // Redirect to home page on success
                router.push('/')
            } catch {
                setError('An error occurred during registration')
                setLoading(false)
            }
        }
    }

    return (
        <Card className={className} {...props}>
            <CardHeader>
                <CardTitle>{stepper.current.title}</CardTitle>
                <CardDescription>{stepper.current.description}</CardDescription>
                <CardAction>
          <span className={'text-muted-foreground text-xs'}>
            {currentIndex + 1} / {steps.length}
          </span>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        {currentIndex === 0 && <AccountStep />}
                        {currentIndex === 1 && <PersonalStep />}
                        {currentIndex === 2 && <ContactStep />}
                        {currentIndex === 3 && <PaymentStep />}
                        {error && (
                            <Field>
                                <div className="text-sm text-red-600">{error}</div>
                            </Field>
                        )}
                        <Field>
                            <div className={'flex justify-end gap-2'}>
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
                                    <Button type={'submit'}>
                                        Next
                                    </Button>
                                )}
                            </div>
                            {currentIndex === 0 && (
                                <FieldDescription className="text-center">
                                    Already have an account? <a href="/login">Login</a>
                                </FieldDescription>
                            )}
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}

function AccountStep() {
    return (
        <>
            <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="mail@example.com"
                    required
                />
            </Field>
            <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <FieldDescription>Must be at least 8 characters long</FieldDescription>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    minLength={8}
                    required
                />
            </Field>
            <Field>
                <FieldLabel htmlFor="passwordrepeat">Repeat Password</FieldLabel>
                <Input
                    id="passwordrepeat"
                    name="passwordrepeat"
                    type="password"
                    minLength={8}
                    required
                />
            </Field>
        </>
    )
}

function PersonalStep() {
    return (
        <>
            <Field>
                <FieldLabel htmlFor="firstname">First Name</FieldLabel>
                <Input
                    id="firstname"
                    name="firstname"
                    type="text"
                    placeholder="John"
                    maxLength={50}
                    required
                />
            </Field>
            <Field>
                <FieldLabel htmlFor="middlename">Middle Name</FieldLabel>
                <Input
                    id="middlename"
                    name="middlename"
                    type="text"
                    placeholder="Pork"
                    maxLength={50}
                />
            </Field>
            <Field>
                <FieldLabel htmlFor="lastname">Last Name</FieldLabel>
                <Input
                    id="lastname"
                    name="lastname"
                    type="text"
                    placeholder="Doe"
                    maxLength={50}
                    required
                />
            </Field>
            <Field>
                <FieldLabel htmlFor="birthdate">Date of Birth</FieldLabel>
                <Input
                    id="birthdate"
                    name="birthdate"
                    type="date"
                    required
                />
            </Field>
        </>
    )
}

function ContactStep() {
    return (
        <>
            <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    maxLength={20}
                />
            </Field>
            <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="123 Main St, City, Country"
                />
            </Field>
        </>
    )
}

function PaymentStep() {
    const [paymentType, setPaymentType] = useState<'credit_card' | 'iban'>('credit_card')

    return (
        <>
            <Field>
                <FieldLabel htmlFor="paymentType">Payment Method</FieldLabel>
                <select
                    id="paymentType"
                    name="paymentType"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as 'credit_card' | 'iban')}
                >
                    <option value="credit_card">Credit Card</option>
                    <option value="iban">IBAN</option>
                </select>
            </Field>
            <Field>
                <FieldLabel htmlFor="paymentInfo">
                    {paymentType === 'credit_card' ? 'Credit Card Number' : 'IBAN'}
                </FieldLabel>
                <FieldDescription>
                    {paymentType === 'credit_card' 
                        ? 'Enter your credit card number (e.g., 1234 5678 9012 3456)'
                        : 'Enter your IBAN (e.g., DE89 3704 0044 0532 0130 00)'}
                </FieldDescription>
                <Input
                    id="paymentInfo"
                    name="paymentInfo"
                    type="text"
                    placeholder={paymentType === 'credit_card' ? '1234 5678 9012 3456' : 'DE89 3704 0044 0532 0130 00'}
                />
            </Field>
        </>
    )
}
