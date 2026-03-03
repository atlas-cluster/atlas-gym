import { getDashboardData } from '@/features/dashboard/actions/get-dashboard-data'
import { DashboardController } from '@/features/dashboard/components/dashboard-controller'

export default async function DashboardPage() {
  const data = await getDashboardData()

  return <DashboardController data={data} />
}
