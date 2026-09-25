import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getAuthToken } from '@/lib/api'

import DashboardTexture from './-components/dashboard-texture'

export const Route = createFileRoute('/_authed')({
  beforeLoad({ location }) {
    if (!getAuthToken()) {
      throw redirect({
        to: '/login',
        search: { redirect: location.pathname + location.searchStr },
        replace: true,
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="m-12">
              <Outlet />
              <DashboardTexture />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
