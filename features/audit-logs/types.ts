import {
  Activity,
  Bookmark,
  Calendar,
  Layers,
  MapPin,
  MonitorSmartphone,
  PersonStanding,
  Repeat,
  Users,
} from 'lucide-react'

export const entityIcons: Record<string, typeof Activity> = {
  member: Users,
  session: MonitorSmartphone,
  plan: Layers,
  subscription: Repeat,
  course: PersonStanding,
  reservation: Bookmark,
  room: MapPin,
  course_template: Calendar,
}

export type Action = 'Create' | 'Update' | 'Delete'

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
