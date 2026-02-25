'use client'

import { toast } from 'sonner'

import { PlanDisplay, deletePlan } from '@/features/plans'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/features/shared/components/ui/alert-dialog'

interface PlanDeleteDialogProps {
  plan: PlanDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlanDeleteDialog({
  plan,
  open,
  onOpenChange,
}: PlanDeleteDialogProps) {
  function onDelete(id: string) {
    const promise = deletePlan(id).then((result) => {
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete plan')
      }
      onOpenChange(false)
      return result
    })

    toast.promise(promise, {
      loading: 'Deleting plan...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to delete plan',
    })
  }

  const onSubmit = () => {
    if (plan) {
      onDelete(plan?.id)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this plan?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All subscriptions associated with this
            plan will also be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onSubmit}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
