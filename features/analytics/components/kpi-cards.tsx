'use client'

import {
  BookmarkIcon,
  CalendarIcon,
  CreditCardIcon,
  LayersIcon,
  PersonStandingIcon,
  UsersIcon,
  XCircleIcon,
} from 'lucide-react'
import { ReactNode } from 'react'

import type { KpiData } from '@/features/analytics/types'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/features/shared/components/ui/card'

interface KpiCardsProps {
  data: KpiData
}

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: ReactNode
}

function KpiCard({ title, value, subtitle, icon }: KpiCardProps) {
  return (
    <Card className="gap-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">
            {title}
          </span>
          <span className="text-muted-foreground">{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  )
}

export function KpiCards({ data }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        title="Total Members"
        value={data.totalMembers.toLocaleString('de-DE')}
        icon={<UsersIcon className="h-4 w-4" />}
      />
      <KpiCard
        title="Active Subscriptions"
        value={data.activeSubscriptions.toLocaleString('de-DE')}
        subtitle={`${data.cancelledSubscriptions} pending cancellation`}
        icon={<CreditCardIcon className="h-4 w-4" />}
      />
      <KpiCard
        title="Monthly Revenue"
        value={data.monthlyRecurringRevenue.toLocaleString('de-DE', {
          style: 'currency',
          currency: 'EUR',
        })}
        subtitle="From active subscriptions"
        icon={<CreditCardIcon className="h-4 w-4" />}
      />
      <KpiCard
        title="Bookings This Month"
        value={data.totalBookingsThisMonth.toLocaleString('de-DE')}
        icon={<BookmarkIcon className="h-4 w-4" />}
      />
      <KpiCard
        title="Course Sessions"
        value={data.totalCourseSessions.toLocaleString('de-DE')}
        subtitle="This month (not cancelled)"
        icon={<CalendarIcon className="h-4 w-4" />}
      />
      <KpiCard
        title="Avg Bookings / Session"
        value={data.avgBookingsPerSession.toLocaleString('de-DE')}
        subtitle="Last 30 days"
        icon={<PersonStandingIcon className="h-4 w-4" />}
      />
      <KpiCard
        title="Active Course Templates"
        value={data.totalCourseTemplates.toLocaleString('de-DE')}
        icon={<LayersIcon className="h-4 w-4" />}
      />
      <KpiCard
        title="Cancelled Subscriptions"
        value={data.cancelledSubscriptions.toLocaleString('de-DE')}
        subtitle="Currently pending cancellation"
        icon={<XCircleIcon className="h-4 w-4" />}
      />
    </div>
  )
}
