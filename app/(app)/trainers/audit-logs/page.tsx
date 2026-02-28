import { AuditLogsDataTable, getAuditLogs } from '@/features/audit-logs'

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
  const auditLogs = await getAuditLogs()

  return <AuditLogsDataTable initialData={auditLogs} />
}
