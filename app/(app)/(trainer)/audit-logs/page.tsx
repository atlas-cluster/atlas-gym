import { DataTable, getAuditLogs } from '@/features/audit-logs'

export const dynamic = 'force-dynamic'

export default async function AuditLogsPage() {
  // Fetch all data for client-side filtering
  const auditLogs = await getAuditLogs({ pageSize: 1000 })

  return <DataTable initialData={auditLogs} />
}
