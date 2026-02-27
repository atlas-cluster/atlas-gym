'use client'
import { CreditCardIcon, KeyRoundIcon, LogOut, UserPenIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/features/auth/components/auth-provider'
import {
  MemberDisplay,
  UpdateMemberDetailsDialog,
  UpdateMemberPasswordDialog,
  UpdateMemberPaymentDialog,
} from '@/features/members'
import { Avatar, AvatarFallback } from '@/features/shared/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/features/shared/components/ui/sidebar'
import { Skeleton } from '@/features/shared/components/ui/skeleton'

const MemberDetails = ({
  memberExists,
  getInitials,
  getFullName,
  getEmail,
}: {
  memberExists: boolean
  getInitials: () => string
  getFullName: () => string
  getEmail: () => string
}) => (
  <>
    <div className={'flex size-8 items-center justify-center'}>
      <Avatar>
        <AvatarFallback>{memberExists ? getInitials() : ''}</AvatarFallback>
      </Avatar>
    </div>
    <div className="grid flex-1 text-left text-sm leading-tight data-[state=closed]:w-0">
      <span className="h-4 truncate font-medium">
        {memberExists ? (
          getFullName()
        ) : (
          <Skeleton className={'w-f m-1 h-full'} />
        )}
      </span>
      <span className="text-muted-foreground h-[10pt] truncate text-xs">
        {memberExists ? (
          getEmail()
        ) : (
          <Skeleton className={'m-1 h-full w-4/5'} />
        )}
      </span>
    </div>
  </>
)

export function SidebarMemberDetails() {
  const { isMobile } = useSidebar()
  const { member, loading, logout, refreshMember } = useAuth()
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)

  const memberExists = Boolean(member && !loading)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch (err) {
      console.error('Logout error:', err)
      toast.error('Failed to logout')
    }
  }

  const memberDisplay: MemberDisplay | null = member ?? null

  const deferredRefresh = useCallback(() => {
    setTimeout(() => refreshMember(), 200)
  }, [refreshMember])

  const getInitials = () => {
    // Assume `member` exists when this is called.
    // Use optional chaining only to avoid runtime errors in unexpected cases.
    const firstInitial = member?.firstname?.[0] || ''
    const lastInitial = member?.lastname?.[0] || ''
    return (firstInitial + lastInitial).toUpperCase()
  }

  const getFullName = () => {
    // Assume `member` exists when this is called.
    const parts = [
      member?.firstname,
      member?.middlename,
      member?.lastname,
    ].filter(Boolean)
    return parts.join(' ')
  }

  const getEmail = () => {
    return member?.email || ''
  }

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <MemberDetails
              memberExists={memberExists}
              getInitials={getInitials}
              getFullName={getFullName}
              getEmail={getEmail}
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              suppressHydrationWarning
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <MemberDetails
                memberExists={memberExists}
                getInitials={getInitials}
                getFullName={getFullName}
                getEmail={getEmail}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <MemberDetails
                  memberExists={memberExists}
                  getInitials={getInitials}
                  getFullName={getFullName}
                  getEmail={getEmail}
                />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setDetailsDialogOpen(true)}>
                <UserPenIcon />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPaymentDialogOpen(true)}>
                <CreditCardIcon />
                Edit Payment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
                <KeyRoundIcon />
                Change Password
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <UpdateMemberDetailsDialog
          key={'details' + member?.id}
          member={memberDisplay}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onSuccess={deferredRefresh}
        />
        <UpdateMemberPaymentDialog
          key={'payment' + member?.id}
          member={memberDisplay}
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          onSuccess={deferredRefresh}
        />
        <UpdateMemberPasswordDialog
          member={memberDisplay}
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
          onSuccess={deferredRefresh}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
