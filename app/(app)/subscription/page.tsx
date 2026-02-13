import {
  SubscriptionGrid,
  getAvailablePlans,
  getMemberSubscriptions,
} from '@/features/subscriptions'

export const dynamic = 'force-dynamic'

export default async function SubscriptionPage() {
  const [subscriptions, plans] = await Promise.all([
    getMemberSubscriptions(),
    getAvailablePlans(),
  ])

  return (
    <SubscriptionGrid
      initialSubscriptions={subscriptions}
      initialPlans={plans}
    />
  )
}
