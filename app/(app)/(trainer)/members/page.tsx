import { MembersDataTable, getMembers } from '@/features/members'

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
  const members = await getMembers()

  return <MembersDataTable initialData={members} />
}
