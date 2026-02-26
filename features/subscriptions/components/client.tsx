'use client'

import { SubscriptionDisplay } from '@/features/subscriptions'
import { DataTable } from '@/features/subscriptions/components/data-table'

export function TableClient({ data }: { data: SubscriptionDisplay[] }) {
  function createSubscription(plan: SubscriptionDisplay) {
    console.log('Creating subscription with plan:', plan)
  }

  function cancelSubscription(plan: SubscriptionDisplay) {
    console.log('Canceling subscription with plan:', plan)
  }

  function revertCancelSubscription(plan: SubscriptionDisplay) {
    console.log('Reverting cancellation of subscription with plan:', plan)
  }

  return (
    <>
      <DataTable
        data={data}
        onCreate={createSubscription}
        onCancel={cancelSubscription}
        onRevertCancel={revertCancelSubscription}
      />
    </>
  )
}
