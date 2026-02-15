export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE'

export interface AuditLogDisplay {
  id: string
  memberId: string
  memberName: string
  entityId: string
  entityType: string
  action: ActionType
  description: string
  createdAt: string // Serialized as string when passing from server to client
}

export interface AuditLogsParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  action?: ActionType
  entityType?: string
  member?: string
}

export interface AuditLogsResponse {
  data: AuditLogDisplay[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
}
