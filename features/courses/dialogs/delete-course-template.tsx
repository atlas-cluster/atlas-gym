'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { CourseTemplateDisplay, deleteCourseTemplate } from '@/features/courses'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'

interface DeleteCourseTemplateDialogProps {
  template: CourseTemplateDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteCourseTemplateDialog({
  template,
  open,
  onOpenChange: setOpen,
}: DeleteCourseTemplateDialogProps) {
  const [isPending, setIsPending] = useState(false)

  function onDelete(id: string, updatedAt: Date) {
    setIsPending(true)
    const promise = deleteCourseTemplate(id, updatedAt)
      .then((result) => {
        if (!result.success) throw new Error(result.message || 'Failed to delete template')
        setOpen(false)
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Deleting course template...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to delete course template',
    })
  }

  const onSubmit = () => {
    if (template) {
      onDelete(template.id, template.updatedAt)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this course template?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All course sessions and bookings associated with{' '}
            <strong>{template?.name}</strong> will also be deleted.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" type="button" onClick={onSubmit} disabled={isPending}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
