'use client'

import { useState } from 'react'

import { CourseTemplateDisplay } from '@/features/courses'
import { RoomOption } from '@/features/courses/actions/get-room-options'
import { TrainerOption } from '@/features/courses/actions/get-trainer-options'
import { CourseTemplatesDataTable } from '@/features/courses/components/course-template-data-table'
import { DeleteCourseTemplateDialog } from '@/features/courses/dialog/delete-course-template'
import { UpdateCourseTemplateDialog } from '@/features/courses/dialog/update-course-template-details'

export function CourseTemplatesController({
  data,
  trainers,
  rooms,
}: {
  data: CourseTemplateDisplay[]
  trainers: TrainerOption[]
  rooms: RoomOption[]
}) {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false)
  const [selectedCourseTemplate, setSelectedCourseTemplate] =
    useState<CourseTemplateDisplay | null>(null)

  function openCreateDialog() {
    setSelectedCourseTemplate(null)
    setDetailsDialogOpen(true)
  }

  function openEditDialog(courseTemplate: CourseTemplateDisplay) {
    setSelectedCourseTemplate(courseTemplate)
    setDetailsDialogOpen(true)
  }

  function openDeleteDialog(courseTemplate: CourseTemplateDisplay) {
    setSelectedCourseTemplate(courseTemplate)
    setConfirmDeleteDialogOpen(true)
  }

  return (
    <>
      <CourseTemplatesDataTable
        data={data}
        onCreate={openCreateDialog}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

      <UpdateCourseTemplateDialog
        key={selectedCourseTemplate?.id ?? 'create'}
        courseTemplate={selectedCourseTemplate}
        trainers={trainers}
        rooms={rooms}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

      <DeleteCourseTemplateDialog
        courseTemplate={selectedCourseTemplate}
        open={confirmDeleteDialogOpen}
        onOpenChange={setConfirmDeleteDialogOpen}
      />
    </>
  )
}
