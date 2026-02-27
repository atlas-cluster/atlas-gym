'use client'
import { CreditCardIcon, KeyRoundIcon, LogOut, UserPenIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { useAuth } from '@/features/auth/components/auth-provider'
import {
  changePasswordSchema,
  memberDetailsSchema,
  memberPaymentSchema,
  updateMember,
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
  const { member, loading, logout } = useAuth()
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

  const handleUpdateDetails = async (
    data: z.infer<typeof memberDetailsSchema>
  ) => {
    if (!member?.id) return
    const promise = updateMember(member.id, data).then(() => {
      setDetailsDialogOpen(false)
      // Reload to refresh session data
      window.location.reload()
    })

    toast.promise(promise, {
      loading: 'Updating details...',
      success: 'Details updated successfully',
      error: (err) => err?.message || 'Failed to update details',
    })
  }

  const handleUpdatePayment = async (
    data: z.infer<typeof memberPaymentSchema>
  ) => {
    if (!member?.id) return
    const promise = updateMemberPayment(member.id, data).then(() => {
      setPaymentDialogOpen(false)
    })

    toast.promise(promise, {
      loading: 'Updating payment...',
      success: 'Payment updated successfully',
      error: (err) => err?.message || 'Failed to update payment',
    })
  }

  const handleChangePassword = async (
    data: z.infer<typeof changePasswordSchema>
  ) => {
    if (!member?.id) return
    const promise = changePassword(member.id, data).then(() => {
      setPasswordDialogOpen(false)
    })

    toast.promise(promise, {
      loading: 'Changing password...',
      success: 'Password changed successfully',
      error: (err) => err?.message || 'Failed to change password',
    })
  }

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

        {/*/!* Dialogs *!/*/}
        {/*<MemberDetailsDialog*/}
        {/*  member={member || undefined}*/}
        {/*  open={detailsDialogOpen}*/}
        {/*  onOpenChange={setDetailsDialogOpen}*/}
        {/*  onSubmit={handleUpdateDetails}*/}
        {/*/>*/}
        {/*<MemberPaymentDialog*/}
        {/*  member={member || undefined}*/}
        {/*  open={paymentDialogOpen}*/}
        {/*  onOpenChange={setPaymentDialogOpen}*/}
        {/*  onSubmit={handleUpdatePayment}*/}
        {/*/>*/}
        {/*<ChangePasswordDialog*/}
        {/*  member={member || undefined}*/}
        {/*  open={passwordDialogOpen}*/}
        {/*  onOpenChange={setPasswordDialogOpen}*/}
        {/*  onSubmit={handleChangePassword}*/}
        {/*/>*/}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
