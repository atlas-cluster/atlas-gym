import {
  SubscriptionsTableClient,
  getSubscriptions,
} from '@/features/subscriptions'

export const dynamic = 'force-dynamic'

export default async function SubscriptionPage() {
  const subscriptions = await getSubscriptions()

  return <SubscriptionsTableClient data={subscriptions} />
}
