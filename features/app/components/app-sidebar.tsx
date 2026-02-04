'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/features/shared/components/ui/sidebar'
import {
  DumbbellIcon,
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  ReceiptTextIcon,
  BookCheckIcon,
  MapPinIcon,
  UserStarIcon,
} from 'lucide-react'
import Image from 'next/image'
import { AppStatus } from '@/features/app/components/app-status'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
            <span className="text-md font-medium">Atlas Gym</span>
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
      </SidebarContent>
    </Sidebar>
  )
}
