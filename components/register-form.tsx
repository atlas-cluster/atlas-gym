'use client'
import { useState } from 'react'
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
    }
)

export function RegisterForm({
                                 className,
                                 ...props
                             }: React.ComponentProps<'div'>) {
    const stepper = useStepper()
    const currentIndex = utils.getIndex(stepper.current.id)

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        console.log('Form data:', data)

        if (!stepper.isLast) {
            stepper.next()
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
                        <Field>
                            <div className={'flex justify-end gap-2'}>
                                <Button
                                    type={'button'}
                                    variant={'secondary'}
                                    disabled={stepper.isFirst}
                                    onClick={stepper.prev}>
                                    Back
                                </Button>
                                {stepper.isLast ? (
                                    <Button type={'submit'}>Create Account</Button>
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
                    minLength={5}
                    required
                />
            </Field>
            <Field>
                <FieldLabel htmlFor="passwordrepeat">Repeat Password</FieldLabel>
                <Input
                    id="passwordrepeat"
                    name="passwordrepeat"
                    type="password"
                    minLength={5}
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
