'use client'

import { useState } from 'react'

import { SubscriptionDisplay } from '@/features/subscriptions'
import { DataTable } from '@/features/subscriptions/components/data-table'
import { SubscriptionCancelDialog } from '@/features/subscriptions/dialogs/subscription-cancel'
import { SubscriptionCreateDialog } from '@/features/subscriptions/dialogs/subscription-create'
import { SubscriptionRevertCancelDialog } from '@/features/subscriptions/dialogs/subscription-revert-cancel'

export function TableClient({ data }: { data: SubscriptionDisplay[] }) {
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
      <DataTable
        data={data}
        onCreate={createSubscription}
        onCancel={cancelSubscription}
        onRevertCancel={revertCancelSubscription}
      />

      <SubscriptionCreateDialog
        subscription={selectedSubscription}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <SubscriptionCancelDialog
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
