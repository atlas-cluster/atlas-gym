'use client'

import { useState } from 'react'

import { CourseSessionDisplay } from '@/features/courses'
import { RoomOption } from '@/features/courses/actions/get-room-options'
import { TrainerOption } from '@/features/courses/actions/get-trainer-options'
import { CourseSessionsDataTable } from '@/features/courses/components/course-sessions-data-table'
import { OverrideSessionDialog } from '@/features/courses/dialog/override-session'

export function CourseSessionsController({
  data,
  trainers,
  rooms,
}: {
  data: CourseSessionDisplay[]
  trainers: TrainerOption[]
  rooms: RoomOption[]
}) {
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] =
    useState<CourseSessionDisplay | null>(null)

  function openEditDialog(session: CourseSessionDisplay) {
    setSelectedSession(session)
    setOverrideDialogOpen(true)
  }

  return (
    <>
      <CourseSessionsDataTable data={data} onEditSession={openEditDialog} />

      <OverrideSessionDialog
        key={selectedSession?.id ?? 'none'}
        session={selectedSession}
        trainers={trainers}
        rooms={rooms}
        open={overrideDialogOpen}
        onOpenChange={setOverrideDialogOpen}
      />
    </>
  )
}
