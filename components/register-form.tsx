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
import { apiClient, ApiError } from '@/lib/api'
import {
    emailSchema,
    passwordSchema,
    nameSchema,
    optionalNameSchema,
    dateSchema,
    phoneSchema,
    addressSchema,
} from '@/lib/schemas'
import { toast } from 'sonner'

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
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrors({})

        const formDataObj = new FormData(e.currentTarget)
        const data = Object.fromEntries(formDataObj.entries()) as Record<string, string>

        // Merge with previous form data
        const allData = { ...formData, ...data }
        setFormData(allData)

        // Validate current step
        const stepErrors: Record<string, string> = {}
        
        if (currentIndex === 0) {
            // Account step validation
            const emailValidation = emailSchema.safeParse(data.email)
            if (!emailValidation.success) {
                stepErrors.email = emailValidation.error.issues[0].message
            }
            
            const passwordValidation = passwordSchema.safeParse(data.password)
            if (!passwordValidation.success) {
                stepErrors.password = passwordValidation.error.issues[0].message
            }
            
            if (data.password !== data.passwordrepeat) {
                stepErrors.passwordrepeat = 'Passwords do not match'
            }
        } else if (currentIndex === 1) {
            // Personal step validation
            const firstnameValidation = nameSchema.safeParse(data.firstname)
            if (!firstnameValidation.success) {
                stepErrors.firstname = firstnameValidation.error.issues[0].message
            }
            
            const lastnameValidation = nameSchema.safeParse(data.lastname)
            if (!lastnameValidation.success) {
                stepErrors.lastname = lastnameValidation.error.issues[0].message
            }
            
            if (data.middlename) {
                const middlenameValidation = optionalNameSchema.safeParse(data.middlename)
                if (!middlenameValidation.success) {
                    stepErrors.middlename = middlenameValidation.error.issues[0].message
                }
            }
            
            const birthdateValidation = dateSchema.safeParse(data.birthdate)
            if (!birthdateValidation.success) {
                stepErrors.birthdate = birthdateValidation.error.issues[0].message
            }
        } else if (currentIndex === 2) {
            // Contact step validation
            if (data.phone) {
                const phoneValidation = phoneSchema.safeParse(data.phone)
                if (!phoneValidation.success) {
                    stepErrors.phone = phoneValidation.error.issues[0].message
                }
            }
            
            if (data.address) {
                const addressValidation = addressSchema.safeParse(data.address)
                if (!addressValidation.success) {
                    stepErrors.address = addressValidation.error.issues[0].message
                }
            }
        }

        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors)
            toast.error('Please fix the errors in the form')
            return
        }

        if (!stepper.isLast) {
            stepper.next()
        } else {
            // Submit registration
            setLoading(true)
            try {
                // Type the data properly for the API client
                const registrationData = {
                    email: allData.email,
                    password: allData.password,
                    firstname: allData.firstname,
                    lastname: allData.lastname,
                    middlename: allData.middlename || undefined,
                    birthdate: allData.birthdate,
                    address: allData.address || undefined,
                    phone: allData.phone || undefined,
                    paymentType: allData.paymentType || undefined,
                    paymentInfo: allData.paymentInfo || undefined,
                }
                
                await apiClient.register(registrationData)
                
                toast.success('Registration successful! Welcome to Atlas Gym!')
                
                // Redirect to home page on success
                router.push('/')
            } catch (err) {
                console.error('Registration error:', err)
                
                if (err instanceof ApiError) {
                    toast.error(err.message)
                    setErrors({ general: err.message })
                } else {
                    toast.error('An unexpected error occurred')
                    setErrors({ general: 'An unexpected error occurred' })
                }
                
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
                        {currentIndex === 0 && <AccountStep formData={formData} errors={errors} />}
                        {currentIndex === 1 && <PersonalStep formData={formData} errors={errors} />}
                        {currentIndex === 2 && <ContactStep formData={formData} errors={errors} />}
                        {currentIndex === 3 && <PaymentStep formData={formData} />}
                        {errors.general && (
                            <Field>
                                <div className="text-sm text-red-600">{errors.general}</div>
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

function AccountStep({ formData, errors }: { formData: Record<string, string>; errors: Record<string, string> }) {
    return (
        <>
            <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="mail@example.com"
                    defaultValue={formData.email || ''}
                    required
                    aria-invalid={!!errors.email}
                />
                {errors.email && (
                    <div className="text-sm text-red-600 mt-1">{errors.email}</div>
                )}
            </Field>
            <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <FieldDescription>Must contain uppercase, lowercase, and a number. At least 8 characters.</FieldDescription>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    minLength={8}
                    defaultValue={formData.password || ''}
                    required
                    aria-invalid={!!errors.password}
                />
                {errors.password && (
                    <div className="text-sm text-red-600 mt-1">{errors.password}</div>
                )}
            </Field>
            <Field>
                <FieldLabel htmlFor="passwordrepeat">Repeat Password</FieldLabel>
                <Input
                    id="passwordrepeat"
                    name="passwordrepeat"
                    type="password"
                    minLength={8}
                    defaultValue={formData.passwordrepeat || ''}
                    required
                    aria-invalid={!!errors.passwordrepeat}
                />
                {errors.passwordrepeat && (
                    <div className="text-sm text-red-600 mt-1">{errors.passwordrepeat}</div>
                )}
            </Field>
        </>
    )
}

function PersonalStep({ formData, errors }: { formData: Record<string, string>; errors: Record<string, string> }) {
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
                    defaultValue={formData.firstname || ''}
                    required
                    aria-invalid={!!errors.firstname}
                />
                {errors.firstname && (
                    <div className="text-sm text-red-600 mt-1">{errors.firstname}</div>
                )}
            </Field>
            <Field>
                <FieldLabel htmlFor="middlename">Middle Name</FieldLabel>
                <Input
                    id="middlename"
                    name="middlename"
                    type="text"
                    placeholder="Pork"
                    maxLength={50}
                    defaultValue={formData.middlename || ''}
                    aria-invalid={!!errors.middlename}
                />
                {errors.middlename && (
                    <div className="text-sm text-red-600 mt-1">{errors.middlename}</div>
                )}
            </Field>
            <Field>
                <FieldLabel htmlFor="lastname">Last Name</FieldLabel>
                <Input
                    id="lastname"
                    name="lastname"
                    type="text"
                    placeholder="Doe"
                    maxLength={50}
                    defaultValue={formData.lastname || ''}
                    required
                    aria-invalid={!!errors.lastname}
                />
                {errors.lastname && (
                    <div className="text-sm text-red-600 mt-1">{errors.lastname}</div>
                )}
            </Field>
            <Field>
                <FieldLabel htmlFor="birthdate">Date of Birth</FieldLabel>
                <Input
                    id="birthdate"
                    name="birthdate"
                    type="date"
                    defaultValue={formData.birthdate || ''}
                    required
                    aria-invalid={!!errors.birthdate}
                />
                {errors.birthdate && (
                    <div className="text-sm text-red-600 mt-1">{errors.birthdate}</div>
                )}
            </Field>
        </>
    )
}

function ContactStep({ formData, errors }: { formData: Record<string, string>; errors: Record<string, string> }) {
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
                    defaultValue={formData.phone || ''}
                    aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                    <div className="text-sm text-red-600 mt-1">{errors.phone}</div>
                )}
            </Field>
            <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="123 Main St, City, Country"
                    defaultValue={formData.address || ''}
                    aria-invalid={!!errors.address}
                />
                {errors.address && (
                    <div className="text-sm text-red-600 mt-1">{errors.address}</div>
                )}
            </Field>
        </>
    )
}

function PaymentStep({ formData }: { formData: Record<string, string> }) {
    // Validate and set payment type with fallback
    const validPaymentTypes = ['credit_card', 'iban'] as const
    type PaymentType = typeof validPaymentTypes[number]
    
    // Type guard to check if a string is a valid PaymentType
    const isValidPaymentType = (value: string): value is PaymentType => {
        return validPaymentTypes.includes(value as PaymentType)
    }
    
    const initialType: PaymentType = isValidPaymentType(formData.paymentType)
        ? formData.paymentType
        : 'credit_card'
    
    const [paymentType, setPaymentType] = useState<PaymentType>(initialType)

    return (
        <>
            <Field>
                <FieldLabel htmlFor="paymentType">Payment Method</FieldLabel>
                <select
                    id="paymentType"
                    name="paymentType"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    value={paymentType}
                    onChange={(e) => {
                        const value = e.target.value
                        if (isValidPaymentType(value)) {
                            setPaymentType(value)
                        }
                    }}
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
                    defaultValue={formData.paymentInfo || ''}
                />
            </Field>
        </>
    )
}
