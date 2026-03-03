import { format } from 'date-fns'
import { Calendar, Check, PlusCircleIcon, RotateCcw, X } from 'lucide-react'
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
  const active = subscriptions.find((s) => s.isActive && !s.isCancelled)
  const cancelled = subscriptions.find((s) => s.isCancelled)
  const future = subscriptions.find((s) => s.isFuture)

  const current = active ?? cancelled ?? future

  if (current) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Subscription
            {active && !cancelled && (
              <Badge>
                <Check className="size-3" />
                Active
              </Badge>
            )}
            {cancelled && (
              <Badge variant="destructive">
                <X className="size-3" />
                Cancels {format(current.endDate!, 'dd MMM yyyy')}
              </Badge>
            )}
            {future && !active && !cancelled && (
              <Badge variant="secondary">
                <Calendar className="size-3" />
                Starts {format(current.startDate!, 'dd MMM yyyy')}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Your current membership plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-2xl font-bold">{current.name}</p>
            {current.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {current.description}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-muted p-3">
              <p className="text-muted-foreground">Price</p>
              <p className="font-semibold text-base">
                €{current.price.toFixed(2)}/mo
              </p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-muted-foreground">Min. Duration</p>
              <p className="font-semibold text-base">
                {current.minDurationMonths}{' '}
                {current.minDurationMonths === 1 ? 'month' : 'months'}
              </p>
            </div>
            {current.startDate && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-muted-foreground">Started</p>
                <p className="font-semibold text-base">
                  {format(current.startDate, 'dd MMM yyyy')}
                </p>
              </div>
            )}
            {cancelled && current.endDate && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-muted-foreground">Ends</p>
                <p className="font-semibold text-base">
                  {format(current.endDate, 'dd MMM yyyy')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/subscription">
              <RotateCcw className="size-3.5" />
              Manage Subscription
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>No Active Subscription</CardTitle>
        <CardDescription>
          Choose a plan to unlock all gym features and start booking courses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {plans.slice(0, 3).map((plan) => (
          <div
            key={plan.id}
            className="flex items-center justify-between rounded-md border p-3 text-sm">
            <div>
              <p className="font-medium">{plan.name}</p>
              <p className="text-muted-foreground">
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
