import {
  Activity,
  BookCheck,
  Calendar,
  Dumbbell,
  Layers,
  MapPin,
  MonitorSmartphone,
  Repeat,
  Users,
} from 'lucide-react'

export const entityIcons: Record<string, typeof Activity> = {
  member: Users,
  session: MonitorSmartphone,
  plan: Layers,
  subscription: Repeat,
  course: Calendar,
  reservation: BookCheck,
  equipment: Dumbbell,
  room: MapPin,
}

export type Action = 'CREATE' | 'UPDATE' | 'DELETE'

export interface AuditLog {
  member: string
  action: Action
  entity: string
  description?: string
  timestamp: Date
}

export interface GetAuditLogsParams {
  pageIndex: number
  pageSize: number
  sorting?: { id: string; desc: boolean }[]
  columnFilters?: { id: string; value: unknown }[]
  globalFilter?: string
}

export interface GetAuditLogsResponse {
  data: AuditLog[]
  pageCount: number
  rowCount: number
  facets: {
    member: Record<string, number>
    action: Record<string, number>
    entity: Record<string, number>
  }
}
