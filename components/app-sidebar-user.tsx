'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { BookUserIcon, LogOut, SettingsIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/components/auth-context'
import { toast } from 'sonner'

export default function AppSidebarUser() {
  const { isMobile } = useSidebar()
  const { user, loading, logout } = useAuth()

  console.log('[AppSidebarUser] Render - loading:', loading, 'user:', user ? 'present' : 'null')

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
    const parts = [user?.firstname , user?.middlename, user?.lastname].filter(
      Boolean
    )
    return parts.join(' ')
  }

  // Show skeleton only while actively loading
  // If loading is complete but there's no user, that's an error state
  // and the AuthProvider should handle redirecting
  if (loading) {
    console.log('[AppSidebarUser] Showing skeleton - loading in progress')
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // If not loading but no user, something went wrong
  if (!user) {
    console.log('[AppSidebarUser] Error: not loading but no user data')
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="text-muted-foreground text-sm">Error loading user</span>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  console.log('[AppSidebarUser] Showing user info for:', user.email)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className={'flex size-8 items-center justify-center'}>
                <Avatar>
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight data-[state=closed]:w-0">
                <span className="truncate font-medium">{getFullName()}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className={'flex size-8 items-center justify-center'}>
                  <Avatar>
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{getFullName()}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
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
