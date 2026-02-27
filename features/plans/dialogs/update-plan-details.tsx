'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { toast } from 'sonner'
import { z } from 'zod'

import { createPlan, updatePlan } from '@/features/plans'
import { planDetailsSchema } from '@/features/plans/schemas/plan-details'
import { PlanDisplay } from '@/features/plans/types'
import { NumberInput } from '@/features/shared/components/number-input'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'
import { Textarea } from '@/features/shared/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'

interface UpdatePlanDetailsDialogProps {
  plan: PlanDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdatePlanDetailsDialog({
  plan,
  open,
  onOpenChange: setOpen,
}: UpdatePlanDetailsDialogProps) {
  const isEditing = !!plan

  const form = useForm({
    resolver: zodResolver(planDetailsSchema),
    defaultValues: {
      name: '',
      price: 0,
      minDurationMonths: 1,
      description: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        plan
          ? {
              name: plan.name,
              price: plan.price,
              minDurationMonths: plan.minDurationMonths,
              description: plan.description ?? '',
            }
          : {
              name: '',
              price: 0,
              minDurationMonths: 1,
              description: '',
            }
      )
    }
  }, [open, plan, form])

  function onCreate(data: z.infer<typeof planDetailsSchema>) {
    const promise = createPlan(data).then((result) => {
      if (!result.success) {
        throw new Error(result.message || 'Failed to create plan')
      }
      setOpen(false)
      return result
    })

    toast.promise(promise, {
      loading: 'Creating plan...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to create plan',
    })
  }

  function onUpdate(
    id: string,
    data: z.infer<typeof planDetailsSchema>,
    lastUpdatedAt: Date
  ) {
    const promise = updatePlan(id, data, lastUpdatedAt).then((result) => {
      if (!result.success) {
        throw new Error(result.message || 'Failed to update plan')
      }
      setOpen(false)
      return result
    })

    toast.promise(promise, {
      loading: 'Updating plan...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to update plan',
    })
  }

  const handleSubmit = (data: z.infer<typeof planDetailsSchema>) => {
    if (isEditing && plan) {
      onUpdate(plan.id, data, plan.updatedAt)
    } else {
      onCreate(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the plan details below.'
              : 'Create a new membership plan.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id="plan-details-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-3">
          <FieldGroup>
            <Controller
              name={'name'}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    placeholder="e.g., Premium"
                    {...field}
                    value={field.value}
                    aria-invalid={fieldState.invalid}
                    autoComplete={'off'}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                name={'price'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="price">Price (€)</FieldLabel>
                    <NumericFormat
                      id="price"
                      customInput={Input}
                      placeholder="0.00€"
                      thousandSeparator={false}
                      decimalSeparator="."
                      decimalScale={2}
                      fixedDecimalScale
                      suffix="€"
                      allowNegative={false}
                      isAllowed={(values) => (values.floatValue ?? 0) <= 1000}
                      value={field.value ?? 0}
                      onValueChange={(values) => {
                        field.onChange(values.floatValue ?? 0)
                      }}
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name={'minDurationMonths'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="minDurationMonths">
                      Min. Duration (Months)
                    </FieldLabel>
                    <NumberInput
                      {...field}
                      min={1}
                      max={24}
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name={'description'}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    {...field}
                    placeholder="Describe what's included in this plan..."
                    value={field.value}
                    aria-invalid={fieldState.invalid}
                    autoComplete={'off'}
                    rows={3}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              type={'button'}
              onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
