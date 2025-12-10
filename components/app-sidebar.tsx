'use client'
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
} from '@/components/ui/sidebar'
import AppSidebarUser from '@/components/app-sidebar-user'
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
import pkg from '../package.json'
import Image from 'next/image'

export function AppSidebar() {
  return (
    <Sidebar collapsible={'icon'} variant={'floating'}>
      <SidebarHeader>
        <div className={'flex items-center gap-2'}>
          <Image
            src="/atlas_logo_rounded_m.png"
            width={'48'}
            height={'48'}
            className={'size-8'}
            alt={'Logo'}
          />
          <div className="grid flex-1 text-left text-sm leading-tight data-[state=closed]:w-0">
            <span className="truncate font-medium">Atlas Gym</span>
            <span className="text-muted-foreground truncate text-xs">{`v${pkg.version}`}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator className={'m-0'} />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <HomeIcon />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <CalendarIcon />
                Courses
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BookCheckIcon />
                Reservations
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <DumbbellIcon />
                Equipment
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <MapPinIcon />
                Rooms
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Trainer</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <UsersIcon />
                Members
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <ReceiptTextIcon />
                Contracts
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <UserStarIcon />
                Trainers
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator className={'m-0'} />
      <SidebarFooter>
        <AppSidebarUser username="Luca Wahlen" email="mail@lucawahlen.de" />
      </SidebarFooter>
    </Sidebar>
  )
}
