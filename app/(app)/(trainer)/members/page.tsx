import { MembersDataTable, getMembers } from '@/features/members'
import { getPlans } from '@/features/plans'

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
  const [members, plans] = await Promise.all([getMembers(), getPlans()])

  return <MembersDataTable initialData={members} allPlans={plans} />
}
