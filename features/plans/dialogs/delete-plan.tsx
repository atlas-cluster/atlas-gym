'use client'

import { toast } from 'sonner'

import { PlanDisplay, deletePlan } from '@/features/plans'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import { useAsyncAction } from '@/features/shared/hooks/use-async-action'

interface DeletePlanDialogProps {
  plan: PlanDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeletePlanDialog({
  plan,
  open,
  onOpenChange: setOpen,
}: DeletePlanDialogProps) {
  const { isPending, start, stop } = useAsyncAction()

  function onDelete(id: string, updatedAt: Date) {
    if (!start()) return
    const promise = deletePlan(id, updatedAt)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to delete plan')
        }
        setOpen(false)
        return result
      })
      .finally(stop)

    toast.promise(promise, {
      loading: 'Deleting plan...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to delete plan',
    })
  }

  const onSubmit = () => {
    if (plan) {
      onDelete(plan.id, plan.updatedAt)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this plan?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All subscriptions associated with this
            plan will also be deleted.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            type="button"
            onClick={onSubmit}
            disabled={isPending}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
