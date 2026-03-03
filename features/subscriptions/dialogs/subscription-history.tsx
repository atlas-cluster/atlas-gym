'use client'

import { format } from 'date-fns'
import { Calendar, Check, X } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import { Skeleton } from '@/features/shared/components/ui/skeleton'
import {
  SubscriptionHistoryEntry,
  getSubscriptionHistory,
} from '@/features/subscriptions'

interface SubscriptionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionHistoryDialog({
  open,
  onOpenChange: setOpen,
}: SubscriptionHistoryDialogProps) {
  const [history, setHistory] = useState<SubscriptionHistoryEntry[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      startTransition(async () => {
        const data = await getSubscriptionHistory()
        setHistory(data)
      })
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subscription History</DialogTitle>
          <DialogDescription>
            A list of all your subscriptions.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2 max-h-[60vh] overflow-y-auto">
          {isPending ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))
          ) : history.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No subscriptions found.
            </p>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-md border px-4 py-3 text-sm gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium truncate">{entry.planName}</span>
                  {entry.isActive && !entry.isCancelled && (
                    <Badge>
                      <Check />
                      Active
                    </Badge>
                  )}
                  {entry.isCancelled && (
                    <Badge variant="destructive">
                      <X />
                      Cancelled
                    </Badge>
                  )}
                  {entry.isFuture && (
                    <Badge variant="secondary">
                      <Calendar />
                      Future
                    </Badge>
                  )}
                </div>
                <span className="text-muted-foreground text-nowrap">
                  {format(entry.startDate, 'dd.MM.yyyy')} –{' '}
                  {entry.endDate ? format(entry.endDate, 'dd.MM.yyyy') : '∞'}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
