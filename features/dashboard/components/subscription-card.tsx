import { format } from 'date-fns'
import { Calendar, Check, PlusCircleIcon, X } from 'lucide-react'
import Link from 'next/link'

import { PlanDisplayMinimal } from '@/features/plans'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import { SubscriptionDisplay } from '@/features/subscriptions'

interface SubscriptionCardProps {
  subscriptions: SubscriptionDisplay[]
  plans: PlanDisplayMinimal[]
}

export function SubscriptionCard({
  subscriptions,
  plans,
}: SubscriptionCardProps) {
  // active = currently running and not cancelled
  const active = subscriptions.find((s) => s.isActive && !s.isCancelled)
  // cancelled = running but end-dated (will expire)
  const cancelled = subscriptions.find((s) => s.isCancelled)
  // future = starts in the future
  const future = subscriptions.find((s) => s.isFuture)

  // The "primary" subscription to show: prefer active over cancelled, fall back to future-only
  const primary = active ?? cancelled ?? future

  if (primary) {
    return (
      <Card className="flex flex-col h-full overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Subscription
            {active && (
              <Badge>
                <Check className="size-3" />
                Active
              </Badge>
            )}
            {cancelled && (
              <Badge variant="destructive">
                <X className="size-3" />
                Cancels {format(cancelled.endDate!, 'dd MMM yyyy')}
              </Badge>
            )}
            {future && !active && !cancelled && (
              <Badge variant="secondary">
                <Calendar className="size-3" />
                Starts {format(future.startDate!, 'dd MMM yyyy')}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Your current membership plan</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-hidden space-y-2">
          {/* Primary subscription details */}
          <div>
            <p className="text-lg font-bold leading-tight">{primary.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md bg-muted p-2">
              <p className="text-muted-foreground text-xs">Price</p>
              <p className="font-semibold">€{primary.price.toFixed(2)}/mo</p>
            </div>
            <div className="rounded-md bg-muted p-2">
              <p className="text-muted-foreground text-xs">Min. Duration</p>
              <p className="font-semibold">
                {primary.minDurationMonths}{' '}
                {primary.minDurationMonths === 1 ? 'month' : 'months'}
              </p>
            </div>
            {primary.startDate && (
              <div className="rounded-md bg-muted p-2">
                <p className="text-muted-foreground text-xs">Started</p>
                <p className="font-semibold">
                  {format(primary.startDate, 'dd MMM yyyy')}
                </p>
              </div>
            )}
            {cancelled && cancelled.endDate && (
              <div className="rounded-md bg-muted p-2">
                <p className="text-muted-foreground text-xs">Ends</p>
                <p className="font-semibold">
                  {format(cancelled.endDate, 'dd MMM yyyy')}
                </p>
              </div>
            )}
          </div>

          {/* Upcoming plan — always visible, no scroll needed */}
          {future && (active || cancelled) && (
            <div className="rounded-md border border-dashed p-2 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Upcoming Plan
              </p>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{future.name}</p>
                  <p className="text-muted-foreground text-xs">
                    Starts {format(future.startDate!, 'dd MMM yyyy')}
                  </p>
                </div>
                <p className="font-semibold">€{future.price.toFixed(2)}/mo</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle>No Active Subscription</CardTitle>
        <CardDescription>
          Choose a plan to unlock all gym features and start booking courses.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {plans.slice(0, 3).map((plan) => (
          <div
            key={plan.id}
            className="flex items-center justify-between rounded-md border p-2.5 text-sm">
            <div>
              <p className="font-medium">{plan.name}</p>
              <p className="text-muted-foreground text-xs">
                {plan.minDurationMonths}{' '}
                {plan.minDurationMonths === 1 ? 'month' : 'months'} min.
              </p>
            </div>
            <p className="font-semibold">€{plan.price.toFixed(2)}/mo</p>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button asChild size="sm" className="w-full">
          <Link href="/subscription">
            <PlusCircleIcon className="size-3.5" />
            View Plans &amp; Subscribe
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
