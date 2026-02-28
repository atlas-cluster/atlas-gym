'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { MemberDisplay } from '@/features/members'
import { convertToTrainer } from '@/features/members/actions/convert-to-trainer'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'

interface ConvertToTrainerDialogProps {
  member: MemberDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConvertToTrainerDialog({
  member,
  open,
  onOpenChange: setOpen,
}: ConvertToTrainerDialogProps) {
  const [isPending, setIsPending] = useState(false)

  function onConvert(id: string, updatedAt: Date) {
    setIsPending(true)
    const promise = convertToTrainer(id, updatedAt)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to promote to trainer')
        }
        setOpen(false)
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Promoting to trainer...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to promote to trainer',
    })
  }

  const onSubmit = () => {
    if (member) {
      onConvert(member.id, member.updatedAt)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Promote to trainer?</DialogTitle>
          <DialogDescription>
            Are you sure you want to promote{' '}
            <strong>
              {member?.firstname} {member?.lastname}
            </strong>{' '}
            to a trainer? They will gain access to all trainer features
            including member management and audit logs.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isPending}>
            Promote
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
