import { Card } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { CircleAlertIcon } from 'lucide-react'

export default function DashboardPage() {
  return (
    <Card className={'mb-2 h-full'}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleAlertIcon />
          </EmptyMedia>
          <EmptyTitle>No Content Available</EmptyTitle>
          <EmptyDescription>
            There is currently no content to display here. Please check back
            later or add new content to get started.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Card>
  )
}

