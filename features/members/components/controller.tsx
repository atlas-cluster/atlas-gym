'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { MemberDisplay } from '@/features/members'
import { DataTable } from '@/features/members/components/data-table'
import { MemberDetailsDialog } from '@/features/members/dialog/member-details'
import { PlanDisplayMinimal } from '@/features/plans'
import { getPlansMinimal } from '@/features/plans'

export function Controller({ members }: { members: MemberDisplay[] }) {
  const [selectedMember, setSelectedMember] = useState<MemberDisplay | null>(
    null
  )
  const [plans, setPlans] = useState<PlanDisplayMinimal[]>([])

  const [updateDetailsDialogOpen, setUpdateDetailsDialogOpen] = useState(false)

  useEffect(() => {
    try {
      getPlansMinimal().then(setPlans)
    } catch (error) {
      toast.error('Failed to load plans')
    }
  }, [])

  function onDummy(data: unknown): void {
    toast('This action is not implemented yet')
  }

  function openUpdateDetailsDialog(member: MemberDisplay) {
    setSelectedMember(member)
    setUpdateDetailsDialogOpen(true)
  }

  return (
    <>
      <DataTable
        members={members}
        plans={plans}
        onUpdateDetails={openUpdateDetailsDialog}
        onUpdatePayment={onDummy}
        onChangePassword={onDummy}
        onConvertToMember={onDummy}
        onConvertToTrainer={onDummy}
        onChooseSubscription={onDummy}
        onChooseFutureSubscription={onDummy}
        onCancelSubscription={onDummy}
        onCancelFutureSubscription={onDummy}
        onRevertCancelSubscription={onDummy}
        onDeleteSubscription={onDummy}
        onDelete={onDummy}
        onDeleteMany={onDummy}
      />

      <MemberDetailsDialog
        key={selectedMember?.id}
        member={selectedMember}
        open={updateDetailsDialogOpen}
        onOpenChange={setUpdateDetailsDialogOpen}
      />
    </>
  )
}
