'use client'

import { useState } from 'react'

import { CourseTemplateDisplay } from '@/features/courses'
import { CourseTemplatesGrid } from '@/features/courses/components/course-templates-grid'
import { DeleteCourseTemplateDialog } from '@/features/courses/dialogs/delete-course-template'
import { UpdateCourseTemplateDetailsDialog } from '@/features/courses/dialogs/update-course-template-details'

export function CourseTemplatesController({ data }: { data: CourseTemplateDisplay[] }) {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplateDisplay | null>(null)

  function openCreateDialog() {
    setSelectedTemplate(null)
    setDetailsDialogOpen(true)
  }

  function openEditDialog(template: CourseTemplateDisplay) {
    setSelectedTemplate(template)
    setDetailsDialogOpen(true)
  }

  function openDeleteDialog(template: CourseTemplateDisplay) {
    setSelectedTemplate(template)
    setConfirmDeleteDialogOpen(true)
  }

  return (
    <>
      <CourseTemplatesGrid
        data={data}
        onCreate={openCreateDialog}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

      <UpdateCourseTemplateDetailsDialog
        key={selectedTemplate?.id ?? 'create'}
        template={selectedTemplate}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

      <DeleteCourseTemplateDialog
        template={selectedTemplate}
        open={confirmDeleteDialogOpen}
        onOpenChange={setConfirmDeleteDialogOpen}
      />
    </>
  )
}
