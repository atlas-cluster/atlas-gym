'use client'

import { useState } from 'react'

import { PlanDisplay } from '@/features/plans'
import { DataTable } from '@/features/plans/components/data-table'
import { PlanDeleteDialog } from '@/features/plans/dialogs/plan-delete'
import { PlanDetailsDialog } from '@/features/plans/dialogs/plan-details'

export function Controller({ data }: { data: PlanDisplay[] }) {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanDisplay | null>(null)

  function openCreateDialog() {
    setSelectedPlan(null)
    setDetailsDialogOpen(true)
  }

  function openEditDialog(plan: PlanDisplay) {
    setSelectedPlan(plan)
    setDetailsDialogOpen(true)
  }

  function openDeleteDialog(plan: PlanDisplay) {
    setSelectedPlan(plan)
    setConfirmDeleteDialogOpen(true)
  }

  return (
    <>
      <DataTable
        data={data}
        onCreate={openCreateDialog}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

      <PlanDetailsDialog
        key={selectedPlan?.id ?? 'create'}
        plan={selectedPlan}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

      <PlanDeleteDialog
        plan={selectedPlan}
        open={confirmDeleteDialogOpen}
        onOpenChange={setConfirmDeleteDialogOpen}
      />
    </>
  )
}
