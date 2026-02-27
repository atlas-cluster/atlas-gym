'use client'

import { toast } from 'sonner'

import { MemberDisplay } from '@/features/members'
import { deleteMembers } from '@/features/members/actions/delete-members'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'

interface DeleteMembersDialogProps {
  members: MemberDisplay[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteMembersDialog({
  members,
  open,
  onOpenChange: setOpen,
}: DeleteMembersDialogProps) {
  function onDelete(ids: string[]) {
    const promise = deleteMembers(ids).then((result) => {
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete members')
      }
      setOpen(false)
      return result
    })

    toast.promise(promise, {
      loading: `Deleting ${ids.length} member${ids.length === 1 ? '' : 's'}...`,
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to delete members',
    })
  }

  const onSubmit = () => {
    if (members.length > 0) {
      onDelete(members.map((m) => m.id))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete {members.length} member
            {members.length === 1 ? '' : 's'}?
          </DialogTitle>
          <DialogDescription>
            This will permanently delete the selected members and all their
            associated data. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" type="button" onClick={onSubmit}>
            Delete ({members.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
