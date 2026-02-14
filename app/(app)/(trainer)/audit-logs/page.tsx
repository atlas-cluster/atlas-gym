import { DataTable, getAuditLogs } from '@/features/audit-logs'

export const dynamic = 'force-dynamic'

interface AuditLogsPageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    search?: string
    action?: string
    entityType?: string
  }>
}

export default async function AuditLogsPage({
  searchParams,
}: AuditLogsPageProps) {
  const params = await searchParams
  
  const auditLogs = await getAuditLogs({
    page: params.page ? parseInt(params.page, 10) : 1,
    pageSize: params.pageSize ? parseInt(params.pageSize, 10) : 10,
    search: params.search,
    action: params.action as 'CREATE' | 'UPDATE' | 'DELETE' | undefined,
    entityType: params.entityType,
  })

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          View and search system audit logs
        </p>
      </div>
      <DataTable initialData={auditLogs} />
    </div>
  )
}
