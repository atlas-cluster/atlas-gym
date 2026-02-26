import { PlansTableClient, getPlans } from '@/features/plans'

export const dynamic = 'force-dynamic'

export default async function PlansPage() {
  const plans = await getPlans()

  console.log(plans)

  return <PlansTableClient data={plans} />
}
