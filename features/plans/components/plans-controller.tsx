'use client'

import { useState } from 'react'

import { PlanDisplay } from '@/features/plans'
import { PlansDataTable } from '@/features/plans/components/plans-data-table'
import { DeletePlanDialog } from '@/features/plans/dialogs/delete-plan'
import { UpdatePlanDetailsDialog } from '@/features/plans/dialogs/update-plan-details'

export function PlansController({ data }: { data: PlanDisplay[] }) {
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
      <PlansDataTable
        data={data}
        onCreate={openCreateDialog}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

      <UpdatePlanDetailsDialog
        key={selectedPlan?.id ?? 'create'}
        plan={selectedPlan}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

      <DeletePlanDialog
        plan={selectedPlan}
        open={confirmDeleteDialogOpen}
        onOpenChange={setConfirmDeleteDialogOpen}
      />
    </>
  )
}
