'use client'

import {
  CalendarPlus,
  CreditCard,
  GraduationCap,
  KeyRound,
  MoreHorizontalIcon,
  PencilIcon,
  Search,
  Trash,
  Undo2,
  User,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import { MemberDisplay, MembersTableMeta } from '@/features/members'
import { PlanDisplayMinimal } from '@/features/plans'
import { Button } from '@/features/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
} from '@/features/shared/components/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/features/shared/components/ui/input-group'
import { ScrollArea } from '@/features/shared/components/ui/scroll-area'
import { Table } from '@tanstack/react-table'
import { Row } from '@tanstack/table-core'

export function MemberActions({
  row,
  table,
}: {
  row: Row<MemberDisplay>
  table: Table<MemberDisplay>
}) {
  const meta = table.options.meta as MembersTableMeta | undefined
  const member = row.original

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const plans = meta?.plans || []

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size={'icon-sm'} suppressHydrationWarning>
            <span className={'sr-only'}>Open Menu</span>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {selectedRows.length <= 1 || !row.getIsSelected() ? (
            <>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Member</DropdownMenuLabel>
                <DropdownMenuItem
                  onSelect={() => meta?.onUpdateDetails(member)}>
                  <PencilIcon />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => meta?.onUpdatePayment(member)}>
                  <CreditCard />
                  Edit Payment
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => meta?.onUpdatePassword(member)}>
                  <KeyRound />
                  Change Password
                </DropdownMenuItem>
                {!member.isTrainer && (
                  <DropdownMenuItem
                    onSelect={() => meta?.onConvertToTrainer(member)}>
                    <GraduationCap />
                    Promote to Trainer
                  </DropdownMenuItem>
                )}
                {member.isTrainer && (
                  <DropdownMenuItem
                    onSelect={() => meta?.onConvertToMember(member)}>
                    <User />
                    Demote to Member
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant={'destructive'}
                  onSelect={() => meta?.onDelete(member)}>
                  <Trash />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Subscription</DropdownMenuLabel>
                {((member.currentSubscription &&
                  !member.futureSubscription &&
                  member.currentSubscription.isActive &&
                  member.currentSubscription.isCancelled) ||
                  !member.currentSubscription) &&
                  plans && (
                    <SubscriptionSelector
                      member={member}
                      plans={plans}
                      meta={meta}
                    />
                  )}
                {member.currentSubscription &&
                  !member.futureSubscription &&
                  member.currentSubscription.isActive &&
                  !member.currentSubscription.isCancelled && (
                    <DropdownMenuItem
                      onSelect={() => meta?.onCancelSubscription(member)}>
                      <XCircle />
                      Cancel Subscription
                    </DropdownMenuItem>
                  )}

                {member.currentSubscription &&
                  member.currentSubscription.isActive &&
                  member.currentSubscription.isCancelled && (
                    <DropdownMenuItem
                      onSelect={() => meta?.onRevertCancelSubscription(member)}>
                      <Undo2 />
                      Revert Cancellation
                    </DropdownMenuItem>
                  )}
                {member.currentSubscription &&
                  member.futureSubscription &&
                  member.currentSubscription.isActive &&
                  member.currentSubscription.isCancelled &&
                  member.futureSubscription.isFuture && (
                    <DropdownMenuItem
                      onSelect={() => meta?.onCancelFutureSubscription(member)}>
                      <XCircle />
                      Cancel Future Subscription
                    </DropdownMenuItem>
                  )}
                {member.currentSubscription && (
                  <DropdownMenuItem
                    variant={'destructive'}
                    onSelect={() => meta?.onDeleteSubscription(member)}>
                    <Trash />
                    Delete Subscription
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </>
          ) : (
            <>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Member</DropdownMenuLabel>
                <DropdownMenuItem
                  variant={'destructive'}
                  onSelect={() =>
                    meta?.onDeleteMany(selectedRows.map((row) => row.original))
                  }>
                  <Trash />
                  Delete ({selectedRows.length})
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function SubscriptionSelector({
  member,
  plans,
  meta,
}: {
  member: MemberDisplay
  plans: PlanDisplayMinimal[]
  meta?: MembersTableMeta
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const isCurrentPlan = member.currentSubscription?.planId === plan.id
    const isFuturePlan = member.futureSubscription?.planId === plan.id

    return matchesSearch && !(isCurrentPlan || isFuturePlan)
  })

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <CalendarPlus />
        {member.currentSubscription ? 'Choose Future Plan' : 'Choose Plan'}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <InputGroup className={'mb-1'}>
          <InputGroupInput
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              e.stopPropagation()
            }}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        {filteredPlans.length > 0 ? (
          <ScrollArea className="h-75 w-60 pr-3">
            {filteredPlans.map((plan) => (
              <DropdownMenuItem
                key={plan.id}
                onSelect={() =>
                  !member.currentSubscription
                    ? meta?.onChooseSubscription(member, plan)
                    : meta?.onChooseFutureSubscription(member, plan)
                }>
                <div className="flex flex-col">
                  <span className="font-medium">{plan.name}</span>
                  <span className="text-xs text-muted-foreground">
                    €{plan.price.toFixed(2)}/month • {plan.minDurationMonths}{' '}
                    {plan.minDurationMonths === 1 ? 'month' : 'months'} min
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        ) : (
          <Empty className={'w-full h-full'}>
            <EmptyMedia variant="icon">
              <CalendarPlus />
            </EmptyMedia>
            <EmptyDescription>
              {filteredPlans.length === 0 && searchQuery
                ? 'No plans found.'
                : 'No plan available. Please create a plan first.'}
            </EmptyDescription>
          </Empty>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
