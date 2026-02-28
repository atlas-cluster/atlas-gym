'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { MemberDisplay } from '@/features/members'
import { deleteMember } from '@/features/members/actions/delete-member'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'

interface DeleteMemberDialogProps {
  member: MemberDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteMemberDialog({
  member,
  open,
  onOpenChange: setOpen,
}: DeleteMemberDialogProps) {
  const [isPending, setIsPending] = useState(false)

  function onDelete(id: string, updatedAt: Date) {
    setIsPending(true)
    const promise = deleteMember(id, updatedAt)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to delete member')
        }
        setOpen(false)
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Deleting member...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to delete member',
    })
  }

  const onSubmit = () => {
    if (member) {
      onDelete(member.id, member.updatedAt)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete this member?
          </DialogTitle>
          <DialogDescription>
            This will permanently delete{' '}
            <strong>
              {member?.firstname} {member?.lastname}
            </strong>{' '}
            and all associated data. This action cannot be undone.
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
