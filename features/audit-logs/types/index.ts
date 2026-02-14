export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE'

export interface AuditLogDisplay {
  id: string
  memberId: string
  memberName: string
  entityId: string
  entityType: string
  action: ActionType
  description: string
  createdAt: Date
}

export interface AuditLogsParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  action?: ActionType
  entityType?: string
}

export interface AuditLogsResponse {
  data: AuditLogDisplay[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
}
