'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { planDetailsSchema } from '@/features/plans/schemas/plan-details'
import { PlanDisplay } from '@/features/plans/types'
import { Button } from '@/features/shared/components/ui/button'
import { Checkbox } from '@/features/shared/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldLabel,
} from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'
import { Textarea } from '@/features/shared/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'

interface PlanDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: PlanDisplay | null
  onSubmit: (data: z.infer<typeof planDetailsSchema>) => void
}

export function PlanDetailsDialog({
  open,
  onOpenChange,
  plan,
  onSubmit,
}: PlanDetailsDialogProps) {
  const isEditing = !!plan

  const form = useForm<z.infer<typeof planDetailsSchema>>({
    // @ts-expect-error - zod default values cause type inference issues
    resolver: zodResolver(planDetailsSchema),
    defaultValues: {
      name: '',
      price: 0,
      minDurationMonths: 1,
      description: '',
      isDefault: false,
    },
  })

  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        price: plan.price,
        minDurationMonths: plan.minDurationMonths,
        description: plan.description || '',
        isDefault: plan.isDefault,
      })
    } else {
      form.reset({
        name: '',
        price: 0,
        minDurationMonths: 1,
        description: '',
        isDefault: false,
      })
    }
  }, [plan, form])

  // @ts-expect-error - handleSubmit type inference issue with zod schemas
  const handleSubmit = form.handleSubmit(
    (data: z.infer<typeof planDetailsSchema>) => {
      onSubmit(data)
      onOpenChange(false)
    }
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the plan details below.'
              : 'Create a new membership plan.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Plan Name</FieldLabel>
            <FieldContent>
              <Input {...form.register('name')} placeholder="e.g., Premium" />
            </FieldContent>
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Price (€)</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </FieldContent>
              {form.formState.errors.price && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.price.message}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel>Min. Duration (Months)</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register('minDurationMonths', {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="0"
                  placeholder="1"
                />
              </FieldContent>
              {form.formState.errors.minDurationMonths && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.minDurationMonths.message}
                </p>
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <FieldContent>
              <Textarea
                {...form.register('description')}
                placeholder="Describe what's included in this plan..."
                rows={3}
              />
            </FieldContent>
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </Field>

          <Field>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isDefault"
                checked={form.watch('isDefault')}
                onCheckedChange={(checked) =>
                  form.setValue('isDefault', checked === true)
                }
              />
              <FieldLabel htmlFor="isDefault" className="cursor-pointer">
                Set as default plan
              </FieldLabel>
            </div>
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
