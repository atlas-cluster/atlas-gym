import { Card } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { CircleAlertIcon } from 'lucide-react'

export default function EquipmentPage() {
  return (
    <Card className={'mb-2 h-full'}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleAlertIcon />
          </EmptyMedia>
          <EmptyTitle>Equipment</EmptyTitle>
          <EmptyDescription>
            This page is under construction.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Card>
  )
}

