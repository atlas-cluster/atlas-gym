'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { PlanDisplay, getPlans } from '@/features/plans'
import { Button } from '@/features/shared/components/ui/button'
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
  FieldError,
  FieldLabel,
} from '@/features/shared/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'

const choosePlanSchema = z.object({
  planId: z.string().min(1, 'Please select a plan'),
})

interface ChoosePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberId: string
  isFuture?: boolean
  onSubmit: (planId: number, isFuture: boolean) => void
}

export function ChoosePlanDialog({
  open,
  onOpenChange,
  isFuture = false,
  onSubmit,
}: ChoosePlanDialogProps) {
  const [plans, setPlans] = useState<PlanDisplay[]>([])

  const form = useForm<z.infer<typeof choosePlanSchema>>({
    resolver: zodResolver(choosePlanSchema),
    defaultValues: {
      planId: '',
    },
  })

  useEffect(() => {
    if (open) {
      getPlans().then(setPlans)
    }
  }, [open])

  const handleSubmit = form.handleSubmit(
    (data: z.infer<typeof choosePlanSchema>) => {
      onSubmit(parseInt(data.planId), isFuture)
      onOpenChange(false)
      form.reset()
    }
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isFuture ? 'Change to Future Plan' : 'Choose Plan'}
          </DialogTitle>
          <DialogDescription>
            {isFuture
              ? 'Select a plan to activate after the current subscription ends.'
              : 'Select a membership plan to subscribe to.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Plan</FieldLabel>
            <FieldContent>
              <Select
                value={form.watch('planId')}
                onValueChange={(value) => form.setValue('planId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name} - €{plan.price.toFixed(2)}/month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
            {form.formState.errors.planId && (
              <FieldError>{form.formState.errors.planId.message}</FieldError>
            )}
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                form.reset()
              }}>
              Cancel
            </Button>
            <Button type="submit">
              {isFuture ? 'Schedule Plan' : 'Subscribe'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
