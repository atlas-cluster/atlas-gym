'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { MemberDisplay } from '@/features/members'
import { MembersDataTable } from '@/features/members/components/members-data-table'
import { CancelFutureSubscriptionDialog } from '@/features/members/dialog/cancel-future-subscription'
import { CancelSubscriptionDialog } from '@/features/members/dialog/cancel-subscription'
import { ConvertToMemberDialog } from '@/features/members/dialog/convert-to-member'
import { ConvertToTrainerDialog } from '@/features/members/dialog/convert-to-trainer'
import { CreateSubscriptionDialog } from '@/features/members/dialog/create-subscription'
import { DeleteMemberDialog } from '@/features/members/dialog/delete-member'
import { DeleteMembersDialog } from '@/features/members/dialog/delete-members'
import { DeleteSubscriptionDialog } from '@/features/members/dialog/delete-subscription'
import { RevertCancelSubscriptionDialog } from '@/features/members/dialog/revert-cancel-subscription'
import { UpdateMemberDetailsDialog } from '@/features/members/dialog/update-member-details'
import { UpdateMemberPasswordDialog } from '@/features/members/dialog/update-member-password'
import { UpdateMemberPaymentDialog } from '@/features/members/dialog/update-member-payment'
import { PlanDisplayMinimal } from '@/features/plans'
import { getPlansMinimal } from '@/features/plans'

export function MembersController({ members }: { members: MemberDisplay[] }) {
  const [selectedMember, setSelectedMember] = useState<MemberDisplay | null>(
    null
  )
  const [selectedMembers, setSelectedMembers] = useState<MemberDisplay[]>([])
  const [selectedPlan, setSelectedPlan] = useState<PlanDisplayMinimal | null>(
    null
  )
  const [plans, setPlans] = useState<PlanDisplayMinimal[]>([])

  const [updateMemberDetailsDialogOpen, setUpdateMemberDetailsDialogOpen] =
    useState(false)
  const [updateMemberPaymentDialogOpen, setUpdateMemberPaymentDialogOpen] =
    useState(false)
  const [updateMemberPasswordDialogOpen, setUpdateMemberPasswordDialogOpen] =
    useState(false)
  const [deleteMemberDialogOpen, setDeleteMemberDialogOpen] = useState(false)
  const [deleteMembersDialogOpen, setDeleteMembersDialogOpen] = useState(false)
  const [convertToTrainerDialogOpen, setConvertToTrainerDialogOpen] =
    useState(false)
  const [convertToMemberDialogOpen, setConvertToMemberDialogOpen] =
    useState(false)
  const [createSubscriptionDialogOpen, setCreateSubscriptionDialogOpen] =
    useState(false)
  const [cancelSubscriptionDialogOpen, setCancelSubscriptionDialogOpen] =
    useState(false)
  const [
    cancelFutureSubscriptionDialogOpen,
    setCancelFutureSubscriptionDialogOpen,
  ] = useState(false)
  const [
    revertCancelSubscriptionDialogOpen,
    setRevertCancelSubscriptionDialogOpen,
  ] = useState(false)
  const [deleteSubscriptionDialogOpen, setDeleteSubscriptionDialogOpen] =
    useState(false)

  useEffect(() => {
    try {
      getPlansMinimal().then(setPlans)
    } catch {
      toast.error('Failed to load plans')
    }
  }, [])

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

  function openDeleteMemberDialog(member: MemberDisplay) {
    setSelectedMember(member)
    setDeleteMemberDialogOpen(true)
  }

  function openDeleteMembersDialog(members: MemberDisplay[]) {
    setSelectedMembers(members)
    setDeleteMembersDialogOpen(true)
  }

  function openConvertToTrainerDialog(member: MemberDisplay) {
    setSelectedMember(member)
    setConvertToTrainerDialogOpen(true)
  }

  function openConvertToMemberDialog(member: MemberDisplay) {
    setSelectedMember(member)
    setConvertToMemberDialogOpen(true)
  }

  function openChooseSubscriptionDialog(
    member: MemberDisplay,
    plan: PlanDisplayMinimal
  ) {
    setSelectedMember(member)
    setSelectedPlan(plan)
    setCreateSubscriptionDialogOpen(true)
  }

  function openChooseFutureSubscriptionDialog(
    member: MemberDisplay,
    plan: PlanDisplayMinimal
  ) {
    setSelectedMember(member)
    setSelectedPlan(plan)
    setCreateSubscriptionDialogOpen(true)
  }

  function openCancelSubscriptionDialog(member: MemberDisplay) {
    setSelectedMember(member)
    setCancelSubscriptionDialogOpen(true)
  }

  function openCancelFutureSubscriptionDialog(member: MemberDisplay) {
    setSelectedMember(member)
    setCancelFutureSubscriptionDialogOpen(true)
  }

  function openRevertCancelSubscriptionDialog(member: MemberDisplay) {
    setSelectedMember(member)
    setRevertCancelSubscriptionDialogOpen(true)
  }

  function openDeleteSubscriptionDialog(member: MemberDisplay) {
    setSelectedMember(member)
    setDeleteSubscriptionDialogOpen(true)
  }

  return (
    <>
      <MembersDataTable
        members={members}
        plans={plans}
        onUpdateDetails={openUpdateMemberDetailsDialog}
        onUpdatePayment={openUpdateMemberPaymentDialog}
        onUpdatePassword={openUpdateMemberPasswordDialog}
        onConvertToMember={openConvertToMemberDialog}
        onConvertToTrainer={openConvertToTrainerDialog}
        onChooseSubscription={openChooseSubscriptionDialog}
        onChooseFutureSubscription={openChooseFutureSubscriptionDialog}
        onCancelSubscription={openCancelSubscriptionDialog}
        onCancelFutureSubscription={openCancelFutureSubscriptionDialog}
        onRevertCancelSubscription={openRevertCancelSubscriptionDialog}
        onDeleteSubscription={openDeleteSubscriptionDialog}
        onDelete={openDeleteMemberDialog}
        onDeleteMany={openDeleteMembersDialog}
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

      <DeleteMemberDialog
        member={selectedMember}
        open={deleteMemberDialogOpen}
        onOpenChange={setDeleteMemberDialogOpen}
      />

      <DeleteMembersDialog
        members={selectedMembers}
        open={deleteMembersDialogOpen}
        onOpenChange={setDeleteMembersDialogOpen}
      />

      <ConvertToTrainerDialog
        key={'trainer' + selectedMember?.id}
        member={selectedMember}
        open={convertToTrainerDialogOpen}
        onOpenChange={setConvertToTrainerDialogOpen}
      />

      <ConvertToMemberDialog
        key={'member' + selectedMember?.id}
        member={selectedMember}
        open={convertToMemberDialogOpen}
        onOpenChange={setConvertToMemberDialogOpen}
      />

      <CreateSubscriptionDialog
        key={'create-sub' + selectedMember?.id + selectedPlan?.id}
        member={selectedMember}
        plan={selectedPlan}
        open={createSubscriptionDialogOpen}
        onOpenChange={setCreateSubscriptionDialogOpen}
      />

      <CancelSubscriptionDialog
        key={'cancel-sub' + selectedMember?.id}
        member={selectedMember}
        open={cancelSubscriptionDialogOpen}
        onOpenChange={setCancelSubscriptionDialogOpen}
      />

      <CancelFutureSubscriptionDialog
        key={'cancel-future-sub' + selectedMember?.id}
        member={selectedMember}
        open={cancelFutureSubscriptionDialogOpen}
        onOpenChange={setCancelFutureSubscriptionDialogOpen}
      />

      <RevertCancelSubscriptionDialog
        key={'revert-sub' + selectedMember?.id}
        member={selectedMember}
        open={revertCancelSubscriptionDialogOpen}
        onOpenChange={setRevertCancelSubscriptionDialogOpen}
      />

      <DeleteSubscriptionDialog
        key={'delete-sub' + selectedMember?.id}
        member={selectedMember}
        open={deleteSubscriptionDialogOpen}
        onOpenChange={setDeleteSubscriptionDialogOpen}
      />
    </>
  )
}
