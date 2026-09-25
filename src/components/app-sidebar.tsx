import { Crosshair, LayoutDashboard, Users } from 'lucide-react'
import type * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'

const navMain = [
  {
    items: [
      { name: 'Dashboard', url: '/', icon: LayoutDashboard, isActive: true },
    ],
  },
  {
    title: 'Navigation',
    items: [
      {
        name: 'Teams',
        url: '/teams',
        icon: Users,
      },
      {
        name: 'Matches',
        url: '/matches',
        icon: Crosshair,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isPending } = useCurrentUser()

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {isPending ? (
              <div className="flex min-h-28 flex-col gap-2 p-2">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </div>
            ) : (
              <div className="flex min-h-28 flex-col gap-2 p-2">
                <Avatar size="lg">
                  <AvatarImage
                    src={user?.image_url || undefined}
                    alt={user?.username ?? 'Current user'}
                  />
                  <AvatarFallback>
                    {user ? user.username.charAt(0).toUpperCase() || '?' : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">Welcome back,</p>
                  <p className="font-button text-xl">
                    {user?.username ?? 'Unknown user'}
                  </p>
                </div>
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain sections={navMain} />
      </SidebarContent>
      <SidebarFooter>
        {isPending ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 p-2">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : user ? (
          <NavUser user={user} />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 p-2">
                <Avatar>
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
                <span className="truncate text-sm text-muted-foreground">
                  Unable to load user
                </span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
