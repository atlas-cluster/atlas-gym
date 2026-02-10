'use client'
import { BookUserIcon, LogOut, SettingsIcon } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/features/auth/components/auth-provider'
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

const UserButtonContent = ({
  userExists,
  getInitials,
  getFullName,
  getEmail,
}: {
  userExists: boolean
  getInitials: () => string
  getFullName: () => string
  getEmail: () => string
}) => (
  <>
    <div className={'flex size-8 items-center justify-center'}>
      <Avatar>
        <AvatarFallback>{userExists ? getInitials() : ''}</AvatarFallback>
      </Avatar>
    </div>
    <div className="grid flex-1 text-left text-sm leading-tight data-[state=closed]:w-0">
      <span className="h-4 truncate font-medium">
        {userExists ? getFullName() : <Skeleton className={'w-f m-1 h-full'} />}
      </span>
      <span className="text-muted-foreground h-[10pt] truncate text-xs">
        {userExists ? getEmail() : <Skeleton className={'m-1 h-full w-4/5'} />}
      </span>
    </div>
  </>
)

export function SidebarUserMenu() {
  const { isMobile } = useSidebar()
  const { user, loading, logout } = useAuth()

  const userExists = Boolean(user && !loading)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch (err) {
      console.error('Logout error:', err)
      toast.error('Failed to logout')
    }
  }

  const getInitials = () => {
    // Assume `user` exists when this is called.
    // Use optional chaining only to avoid runtime errors in unexpected cases.
    const firstInitial = user?.firstname?.[0] || ''
    const lastInitial = user?.lastname?.[0] || ''
    return (firstInitial + lastInitial).toUpperCase()
  }

  const getFullName = () => {
    // Assume `user` exists when this is called.
    const parts = [user?.firstname, user?.middlename, user?.lastname].filter(
      Boolean
    )
    return parts.join(' ')
  }

  const getEmail = () => {
    return user?.email || ''
  }

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <UserButtonContent
              userExists={userExists}
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
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <UserButtonContent
                userExists={userExists}
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
                <UserButtonContent
                  userExists={userExists}
                  getInitials={getInitials}
                  getFullName={getFullName}
                  getEmail={getEmail}
                />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BookUserIcon />
                Contract
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
