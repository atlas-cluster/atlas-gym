import {
  SubscriptionsTableClient,
  getSubscriptions,
} from '@/features/subscriptions'

export const dynamic = 'force-dynamic'

export default async function SubscriptionPage() {
  const plans = await getSubscriptions()

  return <SubscriptionsTableClient data={plans} />
}
