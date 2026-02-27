'use client'

import { useState } from 'react'

import { SubscriptionDisplay } from '@/features/subscriptions'
import { SubscriptionsDataTable } from '@/features/subscriptions/components/subscriptions-data-table'
import { CancelSubscriptionDialog } from '@/features/subscriptions/dialogs/cancel-subscription'
import { CreateSubscriptionDialog } from '@/features/subscriptions/dialogs/create-subscription'
import { SubscriptionRevertCancelDialog } from '@/features/subscriptions/dialogs/revert-cancel-subscription'

export function SubscriptionsClient({ data }: { data: SubscriptionDisplay[] }) {
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionDisplay | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [revertCancelOpen, setRevertCancelOpen] = useState(false)

  function createSubscription(plan: SubscriptionDisplay) {
    setSelectedSubscription(plan)
    setCreateOpen(true)
  }

  function cancelSubscription(plan: SubscriptionDisplay) {
    setSelectedSubscription(plan)
    setCancelOpen(true)
  }

  function revertCancelSubscription(plan: SubscriptionDisplay) {
    setSelectedSubscription(plan)
    setRevertCancelOpen(true)
  }

  return (
    <>
      <SubscriptionsDataTable
        data={data}
        onCreate={createSubscription}
        onCancel={cancelSubscription}
        onRevertCancel={revertCancelSubscription}
      />

      <CreateSubscriptionDialog
        subscription={selectedSubscription}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <CancelSubscriptionDialog
        subscription={selectedSubscription}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />

      <SubscriptionRevertCancelDialog
        subscription={selectedSubscription}
        hasFutureSubscription={data.some((s) => s.isFuture)}
        open={revertCancelOpen}
        onOpenChange={setRevertCancelOpen}
      />
    </>
  )
}
