'use client'
import {
  BookCheckIcon,
  CalendarIcon,
  DumbbellIcon,
  HomeIcon,
  MapPinIcon,
  ReceiptTextIcon,
  UserStarIcon,
  UsersIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { AppStatus } from '@/features/app/components/app-status'
import { SidebarUserMenu, useAuth } from '@/features/auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/features/shared/components/ui/sidebar'

const mainNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: HomeIcon },
  { title: 'Courses', url: '/courses', icon: CalendarIcon },
  { title: 'Reservations', url: '/reservations', icon: BookCheckIcon },
  { title: 'Equipment', url: '/equipment', icon: DumbbellIcon },
  { title: 'Rooms', url: '/rooms', icon: MapPinIcon },
]

const trainerNavItems = [
  { title: 'Members', url: '/members', icon: UsersIcon },
  { title: 'Contracts', url: '/contracts', icon: ReceiptTextIcon },
  { title: 'Trainers', url: '/trainers', icon: UserStarIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <Sidebar collapsible={'icon'}>
      <SidebarHeader className={'px-2 py-1'}>
        <div className={'flex items-center overflow-hidden'}>
          <Image
            src="/atlas_logo_rounded_m.png"
            width={48}
            height={48}
            className={'size-8'}
            alt={'Logo'}
          />

          <div className={'ml-2 grid'}>
            <span className="text-md font-medium text-nowrap">Atlas Gym</span>
            <AppStatus />
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator className={'m-0'} />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  tooltip={item.title}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {user?.isTrainer && (
          <SidebarGroup>
            <SidebarGroupLabel>Trainer</SidebarGroupLabel>
            <SidebarMenu>
              {trainerNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarSeparator className={'m-0'} />
      <SidebarFooter>
        <SidebarUserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
