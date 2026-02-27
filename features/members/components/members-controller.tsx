'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { MemberDisplay } from '@/features/members'
import { MembersDataTable } from '@/features/members/components/members-data-table'
import { UpdateMemberDetailsDialog } from '@/features/members/dialog/update-member-details'
import { UpdateMemberPasswordDialog } from '@/features/members/dialog/update-member-password'
import { UpdateMemberPaymentDialog } from '@/features/members/dialog/update-member-payment'
import { PlanDisplayMinimal } from '@/features/plans'
import { getPlansMinimal } from '@/features/plans'

export function MembersController({ members }: { members: MemberDisplay[] }) {
  const [selectedMember, setSelectedMember] = useState<MemberDisplay | null>(
    null
  )
  const [plans, setPlans] = useState<PlanDisplayMinimal[]>([])

  const [updateMemberDetailsDialogOpen, setUpdateMemberDetailsDialogOpen] =
    useState(false)
  const [updateMemberPaymentDialogOpen, setUpdateMemberPaymentDialogOpen] =
    useState(false)
  const [updateMemberPasswordDialogOpen, setUpdateMemberPasswordDialogOpen] =
    useState(false)

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

  function openUpdateMemberDetailsDialog(member: MemberDisplay) {
    setSelectedMember(member)
    setUpdateMemberDetailsDialogOpen(true)
  }

  function openUpdateMemberPaymentDialog(member: MemberDisplay) {
    setSelectedMember(member)
    setUpdateMemberPaymentDialogOpen(true)
  }

  function openUpdateMemberPasswordDialog(member: MemberDisplay) {
    setSelectedMember(member)
    setUpdateMemberPasswordDialogOpen(true)
  }

  return (
    <>
      <MembersDataTable
        members={members}
        plans={plans}
        onUpdateDetails={openUpdateMemberDetailsDialog}
        onUpdatePayment={openUpdateMemberPaymentDialog}
        onUpdatePassword={openUpdateMemberPasswordDialog}
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

      <UpdateMemberDetailsDialog
        key={'details' + selectedMember?.id}
        member={selectedMember}
        open={updateMemberDetailsDialogOpen}
        onOpenChange={setUpdateMemberDetailsDialogOpen}
      />

      <UpdateMemberPaymentDialog
        key={'payment' + selectedMember?.id}
        member={selectedMember}
        open={updateMemberPaymentDialogOpen}
        onOpenChange={setUpdateMemberPaymentDialogOpen}
      />

      <UpdateMemberPasswordDialog
        member={selectedMember}
        open={updateMemberPasswordDialogOpen}
        onOpenChange={setUpdateMemberPasswordDialogOpen}
      />
    </>
  )
}
