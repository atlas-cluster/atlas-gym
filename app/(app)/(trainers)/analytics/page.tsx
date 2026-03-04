import { getAnalyticsData } from '@/features/analytics/actions/get-analytics-data'
import { AnalyticsController } from '@/features/analytics/components/analytics-controller'

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  return <AnalyticsController data={data} />
}
