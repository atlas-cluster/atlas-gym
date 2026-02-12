import { PlansGrid, getPlans } from '@/features/plans'

export const dynamic = 'force-dynamic'

export default async function PlansPage() {
  const plans = await getPlans()

  return <PlansGrid initialData={plans} />
}
